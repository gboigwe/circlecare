;; KindNest Group Treasury - Expense Management
;; Handles expenses, settlements, and member balances for all groups

;; Error codes
(define-constant ERR-UNAUTHORIZED (err u200))
(define-constant ERR-INVALID-AMOUNT (err u201))
(define-constant ERR-INVALID-PARTICIPANT (err u202))
(define-constant ERR-EXPENSE-NOT-FOUND (err u203))
(define-constant ERR-INSUFFICIENT-PAYMENT (err u204))
(define-constant ERR-NO-DEBT (err u205))
(define-constant ERR-MEMBER-NOT-FOUND (err u206))
(define-constant ERR-INVALID-DESCRIPTION (err u207))
(define-constant ERR-GROUP-PAUSED (err u208))
(define-constant ERR-MEMBER-EXISTS (err u209))
(define-constant ERR-MAX-MEMBERS (err u210))
(define-constant ERR-MAX-PARTICIPANTS (err u211))
(define-constant ERR-GROUP-NOT-FOUND (err u212))
(define-constant ERR-DUPLICATE-PARTICIPANT (err u213))
(define-constant ERR-MEMBER-HAS-BALANCE (err u214))
(define-constant ERR-TRANSFER-FAILED (err u215))

;; Constants
(define-constant MAX-PARTICIPANTS u20)
(define-constant MAX-MEMBERS u50)
(define-constant MAX-DESCRIPTION-LENGTH u200)

;; Reference to expense factory contract
(define-data-var factory-contract principal tx-sender)

;; Data structures using maps (all indexed by group-id)

;; Group metadata
(define-map groups
  uint
  {
    name: (string-ascii 50),
    creator: principal,
    created-at: uint,
    paused: bool,
    next-expense-id: uint,
    next-settlement-id: uint,
    member-count: uint
  }
)

;; Members: {group-id, member} => member info
(define-map members
  {group-id: uint, member: principal}
  {
    nickname: (string-ascii 32),
    total-owed: uint,
    total-owing: uint,
    active: bool,
    joined-at: uint
  }
)

;; Expenses: {group-id, expense-id} => expense info
(define-map expenses
  {group-id: uint, expense-id: uint}
  {
    description: (string-ascii 200),
    total-amount: uint,
    paid-by: principal,
    settled: bool,
    timestamp: uint,
    participant-count: uint
  }
)

;; Expense participants: {group-id, expense-id, index} => {participant, share}
(define-map expense-participants
  {group-id: uint, expense-id: uint, index: uint}
  {participant: principal, share: uint}
)

;; Balances: {group-id, debtor, creditor} => amount
(define-map balances
  {group-id: uint, debtor: principal, creditor: principal}
  uint
)

;; Settlements: {group-id, settlement-id} => settlement info
(define-map settlements
  {group-id: uint, settlement-id: uint}
  {
    debtor: principal,
    creditor: principal,
    amount: uint,
    timestamp: uint
  }
)

;; Member list for each group: {group-id, index} => principal
(define-map group-member-list
  {group-id: uint, index: uint}
  principal
)

;; Public Functions

;; Initialize a group (called by factory or creator)
(define-public (initialize-group (group-id uint) (name (string-ascii 50)) (creator principal) (creator-nickname (string-ascii 32)))
  (begin
    ;; Check that group doesn't already exist
    (asserts! (is-none (map-get? groups group-id)) ERR-GROUP-NOT-FOUND)

    ;; Create group
    (map-set groups group-id {
      name: name,
      creator: creator,
      created-at: stacks-block-height,
      paused: false,
      next-expense-id: u1,
      next-settlement-id: u1,
      member-count: u1
    })

    ;; Add creator as first member
    (map-set members {group-id: group-id, member: creator} {
      nickname: creator-nickname,
      total-owed: u0,
      total-owing: u0,
      active: true,
      joined-at: stacks-block-height
    })

    ;; Add to member list
    (map-set group-member-list {group-id: group-id, index: u0} creator)

    (print {event: "group-initialized", group-id: group-id, name: name, creator: creator})
    (ok true)
  )
)

;; Add member to group (only group creator)
(define-public (add-member (group-id uint) (member principal) (nickname (string-ascii 32)))
  (let
    (
      (group (unwrap! (map-get? groups group-id) ERR-GROUP-NOT-FOUND))
      (member-key {group-id: group-id, member: member})
    )
    ;; Validations
    (asserts! (is-eq tx-sender (get creator group)) ERR-UNAUTHORIZED)
    (asserts! (not (get paused group)) ERR-GROUP-PAUSED)
    (asserts! (< (get member-count group) MAX-MEMBERS) ERR-MAX-MEMBERS)
    (asserts! (> (len nickname) u0) ERR-INVALID-DESCRIPTION)
    (asserts! (<= (len nickname) u32) ERR-INVALID-DESCRIPTION)

    ;; Check member doesn't exist
    (asserts! (is-none (map-get? members member-key)) ERR-MEMBER-EXISTS)

    ;; Add member
    (map-set members member-key {
      nickname: nickname,
      total-owed: u0,
      total-owing: u0,
      active: true,
      joined-at: stacks-block-height
    })

    ;; Add to member list
    (map-set group-member-list
      {group-id: group-id, index: (get member-count group)}
      member)

    ;; Update group member count
    (map-set groups group-id (merge group {
      member-count: (+ (get member-count group) u1)
    }))

    (print {event: "member-added", group-id: group-id, member: member, nickname: nickname})
    (ok true)
  )
)

;; Add expense with STX/sBTC amounts
(define-public (add-expense
  (group-id uint)
  (description (string-ascii 200))
  (amount uint)
  (participants (list 20 principal)))
  (let
    (
      (group (unwrap! (map-get? groups group-id) ERR-GROUP-NOT-FOUND))
      (expense-id (get next-expense-id group))
      (participant-count (len participants))
      (share-per-person (/ amount participant-count))
      (remainder (mod amount participant-count))
      (member-key {group-id: group-id, member: tx-sender})
    )
    ;; Validations
    (asserts! (not (get paused group)) ERR-GROUP-PAUSED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (> participant-count u0) ERR-INVALID-PARTICIPANT)
    (asserts! (<= participant-count MAX-PARTICIPANTS) ERR-MAX-PARTICIPANTS)
    (asserts! (> (len description) u0) ERR-INVALID-DESCRIPTION)
    (asserts! (<= (len description) MAX-DESCRIPTION-LENGTH) ERR-INVALID-DESCRIPTION)

    ;; Check sender is active member
    (asserts! (get active (unwrap! (map-get? members member-key) ERR-MEMBER-NOT-FOUND)) ERR-UNAUTHORIZED)

    ;; Validate all participants are active members and check for duplicates
    (try! (validate-participants group-id participants))

    ;; Store expense
    (map-set expenses {group-id: group-id, expense-id: expense-id} {
      description: description,
      total-amount: amount,
      paid-by: tx-sender,
      settled: false,
      timestamp: stacks-block-height,
      participant-count: participant-count
    })

    ;; Store participants and their shares, and update balances
    (try! (process-participants group-id expense-id participants share-per-person remainder))

    ;; Update next expense ID
    (map-set groups group-id (merge group {
      next-expense-id: (+ expense-id u1)
    }))

    (print {
      event: "expense-added",
      group-id: group-id,
      expense-id: expense-id,
      paid-by: tx-sender,
      amount: amount,
      description: description
    })
    (ok expense-id)
  )
)

;; Settle debt in STX
(define-public (settle-debt-stx (group-id uint) (creditor principal) (amount uint))
  (let
    (
      (group (unwrap! (map-get? groups group-id) ERR-GROUP-NOT-FOUND))
      (balance-key {group-id: group-id, debtor: tx-sender, creditor: creditor})
      (debt (default-to u0 (map-get? balances balance-key)))
      (settlement-id (get next-settlement-id group))
      (debtor-key {group-id: group-id, member: tx-sender})
      (creditor-key {group-id: group-id, member: creditor})
      (debtor-info (unwrap! (map-get? members debtor-key) ERR-MEMBER-NOT-FOUND))
      (creditor-info (unwrap! (map-get? members creditor-key) ERR-MEMBER-NOT-FOUND))
    )
    ;; Validations
    (asserts! (not (get paused group)) ERR-GROUP-PAUSED)
    (asserts! (> debt u0) ERR-NO-DEBT)
    (asserts! (>= amount debt) ERR-INSUFFICIENT-PAYMENT)
    (asserts! (get active debtor-info) ERR-UNAUTHORIZED)
    (asserts! (get active creditor-info) ERR-MEMBER-NOT-FOUND)

    ;; Transfer STX
    (try! (stx-transfer? debt tx-sender creditor))

    ;; Update balances
    (map-delete balances balance-key)

    ;; Update member totals
    (map-set members debtor-key (merge debtor-info {
      total-owed: (- (get total-owed debtor-info) debt)
    }))
    (map-set members creditor-key (merge creditor-info {
      total-owing: (- (get total-owing creditor-info) debt)
    }))

    ;; Record settlement
    (map-set settlements {group-id: group-id, settlement-id: settlement-id} {
      debtor: tx-sender,
      creditor: creditor,
      amount: debt,
      timestamp: stacks-block-height
    })

    ;; Update next settlement ID
    (map-set groups group-id (merge group {
      next-settlement-id: (+ settlement-id u1)
    }))

    (print {event: "debt-settled-stx", group-id: group-id, debtor: tx-sender, creditor: creditor, amount: debt})
    (ok settlement-id)
  )
)

;; Pause group (only creator)
(define-public (pause-group (group-id uint))
  (let
    (
      (group (unwrap! (map-get? groups group-id) ERR-GROUP-NOT-FOUND))
    )
    (asserts! (is-eq tx-sender (get creator group)) ERR-UNAUTHORIZED)
    (map-set groups group-id (merge group {paused: true}))
    (print {event: "group-paused", group-id: group-id})
    (ok true)
  )
)

;; Unpause group (only creator)
(define-public (unpause-group (group-id uint))
  (let
    (
      (group (unwrap! (map-get? groups group-id) ERR-GROUP-NOT-FOUND))
    )
    (asserts! (is-eq tx-sender (get creator group)) ERR-UNAUTHORIZED)
    (map-set groups group-id (merge group {paused: false}))
    (print {event: "group-unpaused", group-id: group-id})
    (ok true)
  )
)

;; Update expense description (only creator of expense)
(define-public (update-expense-description (group-id uint) (expense-id uint) (new-description (string-ascii 200)))
  (let
    (
      (expense-key {group-id: group-id, expense-id: expense-id})
      (expense (unwrap! (map-get? expenses expense-key) ERR-EXPENSE-NOT-FOUND))
    )
    (asserts! (is-eq tx-sender (get paid-by expense)) ERR-UNAUTHORIZED)
    (asserts! (not (get settled expense)) ERR-UNAUTHORIZED)
    (asserts! (> (len new-description) u0) ERR-INVALID-DESCRIPTION)
    (asserts! (<= (len new-description) MAX-DESCRIPTION-LENGTH) ERR-INVALID-DESCRIPTION)

    (map-set expenses expense-key (merge expense {description: new-description}))
    (print {event: "expense-updated", group-id: group-id, expense-id: expense-id})
    (ok true)
  )
)

;; Remove member (only creator, member must have zero balance)
(define-public (remove-member (group-id uint) (member principal))
  (let
    (
      (group (unwrap! (map-get? groups group-id) ERR-GROUP-NOT-FOUND))
      (member-key {group-id: group-id, member: member})
      (member-info (unwrap! (map-get? members member-key) ERR-MEMBER-NOT-FOUND))
    )
    (asserts! (is-eq tx-sender (get creator group)) ERR-UNAUTHORIZED)
    (asserts! (not (is-eq member (get creator group))) ERR-UNAUTHORIZED)
    (asserts! (is-eq (get total-owed member-info) u0) ERR-MEMBER-HAS-BALANCE)
    (asserts! (is-eq (get total-owing member-info) u0) ERR-MEMBER-HAS-BALANCE)

    ;; Deactivate member
    (map-set members member-key (merge member-info {active: false}))

    (print {event: "member-removed", group-id: group-id, member: member})
    (ok true)
  )
)

;; Helper functions (private)

;; Validate all participants are active members
(define-private (validate-participants (group-id uint) (participants (list 20 principal)))
  (fold validate-participant participants (ok group-id))
)

(define-private (validate-participant (participant principal) (acc (response uint uint)))
  (match acc
    success
      (let
        (
          (member-key {group-id: success, member: participant})
          (member-info (map-get? members member-key))
        )
        (if (and (is-some member-info) (get active (unwrap-panic member-info)))
          (ok success)
          ERR-INVALID-PARTICIPANT
        )
      )
    error (err error)
  )
)

;; Process participants and update balances (simplified to avoid circular dependencies)
(define-private (process-participants
  (group-id uint)
  (expense-id uint)
  (participants (list 20 principal))
  (base-share uint)
  (remainder uint))
  (let
    (
      (paid-by (get paid-by (unwrap-panic (map-get? expenses {group-id: group-id, expense-id: expense-id}))))
      (context {
        group-id: group-id,
        expense-id: expense-id,
        base-share: base-share,
        remainder: remainder,
        paid-by: paid-by,
        current-index: u0
      })
    )
    (fold process-single-participant participants (ok context))
  )
)

(define-private (process-single-participant
  (participant principal)
  (acc (response {group-id: uint, expense-id: uint, base-share: uint, remainder: uint, paid-by: principal, current-index: uint} uint)))
  (match acc
    success
      (let
        (
          (index (get current-index success))
          (group-id (get group-id success))
          (expense-id (get expense-id success))
          (base-share (get base-share success))
          (remainder (get remainder success))
          (paid-by (get paid-by success))
          (share (if (< index remainder) (+ base-share u1) base-share))
        )
        ;; Store participant and share
        (map-set expense-participants
          {group-id: group-id, expense-id: expense-id, index: index}
          {participant: participant, share: share})

        ;; Update balances if not the payer
        (if (not (is-eq participant paid-by))
          (update-balance group-id participant paid-by share)
          true
        )

        ;; Return updated context with incremented index
        (ok (merge success {current-index: (+ index u1)}))
      )
    error (err error)
  )
)

;; Update balance between debtor and creditor
(define-private (update-balance (group-id uint) (debtor principal) (creditor principal) (amount uint))
  (let
    (
      (balance-key {group-id: group-id, debtor: debtor, creditor: creditor})
      (current-balance (default-to u0 (map-get? balances balance-key)))
      (debtor-key {group-id: group-id, member: debtor})
      (creditor-key {group-id: group-id, member: creditor})
      (debtor-info (unwrap-panic (map-get? members debtor-key)))
      (creditor-info (unwrap-panic (map-get? members creditor-key)))
    )
    ;; Update balance
    (map-set balances balance-key (+ current-balance amount))

    ;; Update member totals
    (map-set members debtor-key (merge debtor-info {
      total-owed: (+ (get total-owed debtor-info) amount)
    }))
    (map-set members creditor-key (merge creditor-info {
      total-owing: (+ (get total-owing creditor-info) amount)
    }))
    true
  )
)

;; Read-only functions

;; Get group info
(define-read-only (get-group (group-id uint))
  (map-get? groups group-id)
)

;; Get member info
(define-read-only (get-member-info (group-id uint) (member principal))
  (map-get? members {group-id: group-id, member: member})
)

;; Get expense
(define-read-only (get-expense (group-id uint) (expense-id uint))
  (map-get? expenses {group-id: group-id, expense-id: expense-id})
)

;; Get expense participant
(define-read-only (get-expense-participant (group-id uint) (expense-id uint) (index uint))
  (map-get? expense-participants {group-id: group-id, expense-id: expense-id, index: index})
)

;; Get balance between debtor and creditor
(define-read-only (get-balance (group-id uint) (debtor principal) (creditor principal))
  (default-to u0 (map-get? balances {group-id: group-id, debtor: debtor, creditor: creditor}))
)

;; Get net balance for a member (what they owe vs what they're owed)
(define-read-only (get-net-balance (group-id uint) (member principal))
  (let
    (
      (member-info (unwrap! (map-get? members {group-id: group-id, member: member}) ERR-MEMBER-NOT-FOUND))
    )
    (ok (- (get total-owing member-info) (get total-owed member-info)))
  )
)

;; Get settlement
(define-read-only (get-settlement (group-id uint) (settlement-id uint))
  (map-get? settlements {group-id: group-id, settlement-id: settlement-id})
)

;; Get group stats
(define-read-only (get-group-stats (group-id uint))
  (let
    (
      (group (unwrap! (map-get? groups group-id) ERR-GROUP-NOT-FOUND))
    )
    (ok {
      name: (get name group),
      creator: (get creator group),
      member-count: (get member-count group),
      total-expenses: (- (get next-expense-id group) u1),
      total-settlements: (- (get next-settlement-id group) u1),
      paused: (get paused group)
    })
  )
)

;; Get member at index
(define-read-only (get-member-at-index (group-id uint) (index uint))
  (map-get? group-member-list {group-id: group-id, index: index})
)

;; Set factory contract (admin function - should be called once)
(define-public (set-factory-contract (factory principal))
  (begin
    (asserts! (is-eq tx-sender (var-get factory-contract)) ERR-UNAUTHORIZED)
    (var-set factory-contract factory)
    (ok true)
  )
)
