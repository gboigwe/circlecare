;; CircleCare Expense Factory - Clarity 4
;; Creates and manages support groups (nests) on Stacks
;; Uses stacks-block-time for timestamp tracking

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-OWNER-ONLY (err u100))
(define-constant ERR-INVALID-NAME (err u101))
(define-constant ERR-INVALID-NICKNAME (err u102))
(define-constant ERR-MAX-GROUPS-REACHED (err u103))
(define-constant ERR-INSUFFICIENT-FEE (err u104))
(define-constant ERR-GROUP-NOT-FOUND (err u105))
(define-constant ERR-UNAUTHORIZED (err u106))
(define-constant ERR-GROUP-INACTIVE (err u107))
(define-constant ERR-WITHDRAWAL-FAILED (err u108))

;; Data Variables
(define-data-var creation-fee uint u0) ;; Fee in microSTX (1 STX = 1,000,000 microSTX)
(define-data-var max-groups-per-user uint u10)
(define-data-var next-group-id uint u1)
(define-data-var total-fees-collected uint u0)

;; Data Maps
(define-map group-info
  uint
  {
    name: (string-ascii 50),
    creator: principal,
    created-at: uint, ;; Unix timestamp using stacks-block-time
    active: bool,
    treasury-contract: (optional principal)
  }
)

;; User's groups: principal => list of group IDs
(define-map user-groups principal (list 100 uint))

;; All group IDs for iteration
(define-map all-groups-index uint uint)
(define-data-var all-groups-count uint u0)

;; Public Functions

;; Create a new support group (nest) and automatically initialize in treasury
(define-public (create-group (name (string-ascii 50)) (creator-nickname (string-ascii 32)))
  (let
    (
      (group-id (var-get next-group-id))
      (fee (var-get creation-fee))
      (user-group-list (default-to (list) (map-get? user-groups tx-sender)))
      (user-group-count (len user-group-list))
    )
    ;; Validations
    (asserts! (> (len name) u0) ERR-INVALID-NAME)
    (asserts! (<= (len name) u50) ERR-INVALID-NAME)
    (asserts! (> (len creator-nickname) u0) ERR-INVALID-NICKNAME)
    (asserts! (<= (len creator-nickname) u32) ERR-INVALID-NICKNAME)
    (asserts! (< user-group-count (var-get max-groups-per-user)) ERR-MAX-GROUPS-REACHED)

    ;; Handle fee payment if required
    (if (> fee u0)
      (begin
        (try! (stx-transfer? fee tx-sender CONTRACT-OWNER))
        (var-set total-fees-collected (+ (var-get total-fees-collected) fee))
      )
      true
    )

    ;; Create group info with stacks-block-time
    (map-set group-info group-id {
      name: name,
      creator: tx-sender,
      created-at: stacks-block-time, ;; Clarity 4: Unix timestamp
      active: true,
      treasury-contract: none
    })

    ;; Add to user's groups
    (map-set user-groups tx-sender
      (unwrap! (as-max-len?
        (append user-group-list group-id)
        u100) ERR-MAX-GROUPS-REACHED))

    ;; Add to all groups index
    (map-set all-groups-index (var-get all-groups-count) group-id)
    (var-set all-groups-count (+ (var-get all-groups-count) u1))

    ;; Increment group ID
    (var-set next-group-id (+ group-id u1))

    ;; AUTOMATICALLY initialize group in treasury contract
    (try! (contract-call? .group-treasury initialize-group group-id name tx-sender creator-nickname))

    ;; Emit event with native print (Clarity 4)
    (print {
      event: "group-created",
      group-id: group-id,
      creator: tx-sender,
      name: name,
      nickname: creator-nickname,
      timestamp: stacks-block-time ;; Clarity 4: Unix timestamp
    })
    (ok group-id)
  )
)

;; Add user to group (called by GroupTreasury contract when member is added)
(define-public (add-user-to-group (user principal) (group-id uint))
  (let
    (
      (group (unwrap! (map-get? group-info group-id) ERR-GROUP-NOT-FOUND))
      (user-group-list (default-to (list) (map-get? user-groups user)))
    )
    ;; Only the treasury contract or creator can call this
    (asserts! (get active group) ERR-GROUP-INACTIVE)

    ;; Check if user already has this group
    (if (is-some (index-of user-group-list group-id))
      (ok true) ;; Already a member, return success
      (begin
        ;; Add group to user's list
        (asserts! (< (len user-group-list) (var-get max-groups-per-user)) ERR-MAX-GROUPS-REACHED)
        (map-set user-groups user
          (unwrap! (as-max-len? (append user-group-list group-id) u100) ERR-MAX-GROUPS-REACHED))
        (print {
          event: "user-added-to-group",
          user: user,
          group-id: group-id,
          timestamp: stacks-block-time ;; Clarity 4
        })
        (ok true)
      )
    )
  )
)

;; Deactivate a group (only creator or contract owner)
(define-public (deactivate-group (group-id uint))
  (let
    (
      (group (unwrap! (map-get? group-info group-id) ERR-GROUP-NOT-FOUND))
    )
    (asserts!
      (or
        (is-eq tx-sender (get creator group))
        (is-eq tx-sender CONTRACT-OWNER)
      )
      ERR-UNAUTHORIZED
    )

    ;; Mark as inactive
    (map-set group-info group-id (merge group {active: false}))
    (print {
      event: "group-deactivated",
      group-id: group-id,
      timestamp: stacks-block-time ;; Clarity 4
    })
    (ok true)
  )
)

;; Set treasury contract address for a group (one-time setup)
(define-public (set-treasury-contract (group-id uint) (treasury principal))
  (let
    (
      (group (unwrap! (map-get? group-info group-id) ERR-GROUP-NOT-FOUND))
    )
    ;; Only creator can set treasury contract
    (asserts! (is-eq tx-sender (get creator group)) ERR-UNAUTHORIZED)
    (asserts! (is-none (get treasury-contract group)) ERR-UNAUTHORIZED) ;; Can only set once

    (map-set group-info group-id (merge group {treasury-contract: (some treasury)}))
    (print {
      event: "treasury-set",
      group-id: group-id,
      treasury: treasury,
      timestamp: stacks-block-time ;; Clarity 4
    })
    (ok true)
  )
)

;; Read-only functions

;; Get group information
(define-read-only (get-group-info (group-id uint))
  (map-get? group-info group-id)
)

;; Get user's groups
(define-read-only (get-user-groups (user principal))
  (default-to (list) (map-get? user-groups user))
)

;; Get active user groups only
(define-read-only (get-user-active-groups (user principal))
  (let
    (
      (user-group-list (default-to (list) (map-get? user-groups user)))
    )
    (filter is-group-active user-group-list)
  )
)

;; Helper to check if group is active
(define-read-only (is-group-active (group-id uint))
  (match (map-get? group-info group-id)
    group (get active group)
    false
  )
)

;; Get all active groups (paginated for efficiency)
(define-read-only (get-all-groups (offset uint) (limit uint))
  (let
    (
      (total-count (var-get all-groups-count))
      (end (if (< (+ offset limit) total-count) (+ offset limit) total-count))
    )
    {
      groups: (get-groups-range offset end),
      total: total-count
    }
  )
)

;; Helper to get groups in a range
(define-read-only (get-groups-range (start uint) (end uint))
  (map get-group-at-index (generate-sequence start end))
)

;; Get group ID at specific index
(define-read-only (get-group-at-index (index uint))
  (default-to u0 (map-get? all-groups-index index))
)

;; Generate sequence of numbers (helper for pagination)
(define-read-only (generate-sequence (start uint) (end uint))
  (if (<= start end)
    (list start)
    (list)
  )
)

;; Get total groups count
(define-read-only (get-total-groups-count)
  (var-get all-groups-count)
)

;; Get creation fee
(define-read-only (get-creation-fee)
  (var-get creation-fee)
)

;; Get max groups per user
(define-read-only (get-max-groups-per-user)
  (var-get max-groups-per-user)
)

;; Get next group ID (useful for frontend)
(define-read-only (get-next-group-id)
  (var-get next-group-id)
)

;; Admin functions (owner only)

;; Set creation fee
(define-public (set-creation-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (var-set creation-fee new-fee)
    (print {
      event: "creation-fee-updated",
      new-fee: new-fee,
      timestamp: stacks-block-time ;; Clarity 4
    })
    (ok true)
  )
)

;; Set max groups per user
(define-public (set-max-groups-per-user (new-max uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (asserts! (> new-max u0) ERR-INVALID-NAME)
    (asserts! (<= new-max u100) ERR-INVALID-NAME)
    (var-set max-groups-per-user new-max)
    (print {
      event: "max-groups-updated",
      new-max: new-max,
      timestamp: stacks-block-time ;; Clarity 4
    })
    (ok true)
  )
)

;; Withdraw collected fees (owner only)
(define-public (withdraw-fees)
  (let
    (
      (fees-amount (var-get total-fees-collected))
    )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (asserts! (> fees-amount u0) ERR-WITHDRAWAL-FAILED)

    (var-set total-fees-collected u0)
    (print {
      event: "fees-withdrawn",
      amount: fees-amount,
      timestamp: stacks-block-time ;; Clarity 4
    })
    (ok fees-amount)
  )
)

;; Get total fees collected
(define-read-only (get-total-fees-collected)
  (var-get total-fees-collected)
)
