# 🔵 CircleCare - Where care flows in circles

*Care-centered expense sharing built on Stacks Bitcoin L2. Fair, transparent, and warm.*

**Care flows in circles.** ✨

Built for the **Stacks Vibe Coding Hackathon 2025** 🏆

## 🌟 What is CircleCare?

CircleCare transforms expense sharing from tracking debts into flowing care. Instead of "you owe Alice $50," we recognize that communities operate in **circles of mutual care**—everyone contributes when they can, everyone receives when they need, and support comes full circle.

Built on Stacks Bitcoin L2 with Clarity smart contracts, CircleCare combines blockchain transparency with human warmth. Every contribution is secured, every moment of care is permanent, and every interaction feels like what it truly is: **caring for each other.**

---

## 🌊 Features

### 💜 **Care-Centered Design**
- **Create Your Circle**: Start circles of care with the people who matter
- **Share Care**: Track contributions transparently where every gesture counts
- **Flow Care Forward**: Support circulates naturally—no pressure, just care
- **Complete the Circle**: Fair reciprocity that feels fair and *is* fair
- **Care Knows No Borders**: Support flows anywhere via blockchain
- **Warm & Balanced**: Every interaction designed with empathy and clarity

### 🎨 **Beautiful, Thoughtful Design**
- **Teal & Purple Gradients**: Colors that evoke flow (water) and care (compassion)
- **Flowing Animations**: Ripple effects, gentle pulses, circular rotations
- **Human-Centered Loading**: "Finding your circles..." instead of cold spinners
- **Glassmorphism UI**: Backdrop blur and soft transparency for modern warmth
- **Heart + Circle Icons**: Care that flows in circles

---

## 💝 **CircleCare Brand Philosophy**

CircleCare embodies four core pillars:

### 🌊 **Warm & Flowing**
*"Care flows in circles."* Support moves naturally through the community, like water finding its course.

### 🔵 **Clear & Balanced**
*"Fair as a circle."* Everyone equal distance from center. Transparency and fairness build trust.

### 💪 **Empowering & Inclusive**
*"Everyone belongs in the circle."* No outsiders. Everyone feels valued and empowered.

### 🎯 **Humble but Purposeful**
*"Quietly keeping care flowing."* We solve real problems without fanfare.

**Design Language**: Teal (flow) + purple (care) gradients. Flowing animations make interactions feel alive. Every word choice reinforces that this is about **care flowing**, not debt tracking.

---

## 🏗️ Architecture

### Smart Contracts (Clarity 4)
- **expense-factory**: Creates and manages circles of care
- **group-treasury**: Handles care tracking, sharing, and circle completion
- Built with Clarity 4 on Stacks for Bitcoin-backed security
- Uses stacks-block-time for Unix timestamp tracking

### Frontend
- **Next.js 15** with React 19 for modern experiences
- **TypeScript** for type safety
- **Tailwind CSS** with custom CircleCare design system (teal/purple)
- **Stacks.js** and **Stacks Connect** for seamless Web3
- **Flowing Animations** with CSS transforms and keyframes

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Stacks wallet (Leather, Xverse, or compatible)
- STX on Stacks Testnet ([get from faucet](https://explorer.hiro.so/sandbox/faucet))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd kind-nest
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

### Frontend Setup

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Open browser**
   Navigate to `http://localhost:3000`

3. **Connect wallet**
   - Click "Connect Stacks Wallet"
   - Make sure you're on Stacks Testnet
   - Get testnet STX from faucet if needed

---

## 🔵 How to Use CircleCare

### 1. **Connect Your Wallet** 💙
- Open CircleCare in your browser
- Click the teal/purple "Connect Wallet" button
- Ensure you're on Stacks Testnet
- *Your wallet is now ready to flow care*

### 2. **Create Your Circle** ⭕
- Click "Create Your Circle" to start something beautiful
- Give your circle a meaningful name like "Family Care Circle" or "Friends Support"
- Choose your caring nickname
- Confirm and watch your circle form ✨

### 3. **Invite to Circle** 🤗
- Open your circle
- Click "Invite to Circle" to grow your community
- Enter their wallet address and a warm nickname
- *Only circle keepers can invite—keeping circles safe and intimate*

### 4. **Share Care** 💜
- Click "Share Care" when someone needs support
- Describe what you're sharing (like "Medical expenses" or "Dinner")
- Enter the amount and select who should contribute
- Watch as care flows through your circle

### 5. **See How Care Flows** 🌊
- View your circle's balance (care flowing to/from you)
- Positive balance = care flowing to you 💙
- Negative balance = time to flow care forward 🔵
- *Every number tells a story of circular care*

### 6. **Flow Care Forward** ✨
- When it's time to complete the circle, click the amount
- Send exactly what's needed
- *Care flows naturally when it feels right*

---

## 🔧 Configuration

### Network Configuration
- **Network**: Stacks Testnet
- **Blockchain**: Bitcoin Layer 2 via Stacks
- **Explorer**: https://explorer.hiro.so/?chain=testnet
- **Faucet**: https://explorer.hiro.so/sandbox/faucet

### Environment Variables

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_NETWORK=testnet
# Add any additional config here
```

---

## 🧪 Testing

### Frontend
```bash
cd frontend
npm run build # Test build
npm run type-check # TypeScript checking
npm run lint # ESLint
```

---

## 📂 Project Structure

```
circlecare-mvp/
├── contracts/                 # Clarity smart contracts
│   ├── contracts/
│   │   ├── groups-treasuri.clar    # Core care & contribution logic
│   │   └── expensess-factori.clar  # Circle creation & management
│   └── tests/                 # Contract tests
├── frontend/                  # CircleCare web application
│   ├── app/                   # Next.js app router
│   │   ├── page.tsx           # Landing page with hero
│   │   ├── dashboard/         # Your circles overview
│   │   ├── groups/[id]/       # Individual circle management
│   │   ├── about/             # CircleCare story & values
│   │   ├── features/          # Features showcase
│   │   ├── how-it-works/      # Step-by-step guide
│   │   └── globals.css        # CircleCare design system & animations
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Button, Input, Card with CircleCare styling
│   │   └── StacksWalletConnect.tsx  # Wallet connection
│   ├── lib/                   # Web3 hooks, utils, & contract interactions
│   │   ├── StacksProvider.tsx      # Stacks context provider
│   │   ├── stacks.ts               # Stacks utilities
│   │   ├── stacksHooks.ts          # React Query hooks
│   │   └── contracts.ts            # Contract interaction functions
│   └── types/                 # TypeScript definitions
├── BRANDING.md               # Complete brand identity guide
└── README.md                 # You are here! 🔵
```

---

## 🔐 Security Considerations

- Clarity contracts are decidable and safer than Solidity
- Only circle keepers can invite members
- Care settlements require exact amounts
- All transactions are transparent on Bitcoin L2
- Records are permanent and secured by Bitcoin

---

## 🌐 Deployment

### Frontend
The frontend can be deployed to any static hosting service:
- Vercel (recommended)
- Netlify
- Cloudflare Pages

```bash
cd frontend
npm run build
npm run start # Production server
```

---

## 🏆 Hackathon Submission

This project was built for the **Stacks Vibe Coding Hackathon 2025** with focus on:
- Consumer-facing blockchain applications
- Human-centered Web3 UX
- Clarity smart contract innovation
- Real-world social utility

### Key Innovation: Circular Care Model

CircleCare introduces a **circular reciprocity model** that transforms expense tracking from:
- ❌ Linear debts (A owes B, B owes C)
- ✅ Circular care flows (everyone → circle → everyone)

This isn't just semantic—it's a fundamental reframe of how communities support each other.

### Demo
[Link to demo video will be added]

### Live Demo
[CircleCare Live](https://circlecare.vercel.app/)

---

## 📞 Support

- **Stacks Documentation**: https://docs.stacks.co/
- **X**: [@CircleCare_xyz](https://x.com/circlecare_xyz)
- **Issues**: Create an issue in this repository

---

## 🔮 **Future Vision**

*The evolution of care:*

### **Phase 2: Enhanced Care Flow**
- **Mobile App**: Flow care on-the-go
- **Push Notifications**: "Your circle needs care"
- **Receipt Scanning**: AI-powered expense tracking
- **Multi-currency**: Global circles of care

### **Phase 3: Community Features**
- **Public Circles**: Community mutual aid networks
- **Care Analytics**: Visualize how care flows
- **Circle Insights**: Understand your care patterns
- **Recurring Care**: Automated monthly contributions

### **Phase 4: Ecosystem**
- **Circle API**: Let other apps integrate care flows
- **Care Tokens**: Reputation and gratitude systems
- **Cross-chain**: Bridges to other networks
- **DAO Governance**: Community-directed development

---

## 💙 **About This Project**

CircleCare was born from a simple belief: **care works best when it flows in circles, not lines.**

Traditional expense apps track debts. CircleCare tracks how care circulates through your community—fair, transparent, continuous. We chose Stacks Bitcoin L2 because **care this important deserves Bitcoin security.**

Every gradient, every animation, every word is chosen to remind us that behind every wallet address is a human heart. Blockchain's greatest power isn't its technology—it's its ability to help us trust and care for each other.

*Care flows in circles.* 🔵✨

---

**Built with 💜 for the Stacks ecosystem and the Stacks Vibe Coding Hackathon 2025**

**CircleCare** - *Where care comes full circle*
