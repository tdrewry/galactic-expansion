```mermaid
graph TD
    A[Index.tsx - Main App] --> B[useGalaxyState Hook]
    A --> C[useShipStats Hook]
    A --> D[useExploration Hook]
    
    B --> E[Galaxy Settings State]
    B --> F[Selection State]
    
    C --> G[useGameSave Hook]
    C --> H[useExplorationEvents Hook]
    C --> I[useJumpMechanics Hook]
    
    G --> J[localStorage Save/Load]
    
    H --> K[Exploration Event Processing]
    K --> L[Stat Updates]
    K --> M[Game Over Checks]
    
    I --> N[Jump Distance Calculations]
    I --> O[Scanner Range Logic]
    I --> P[System Accessibility]
    
    D --> Q[Exploration State Management]
    Q --> R[System Exploration Status]
    Q --> S[Exploration History]
    
    A --> T[Galaxy Generator Utils]
    T --> U[Star System Generation]
    T --> V[Planet Generation]
    T --> W[Civilization Generation]
    T --> X[Nebula Generation]
    
    A --> Y[Starship Generator Utils]
    Y --> Z[Ship Stats Generation]
    Y --> AA[Ship Layout Generation]
    Y --> BB[Ship Options Generation]
    
    A --> CC[Exploration Generator Utils]
    CC --> DD[Market Info Generation]
    CC --> EE[Random Events]
    
    A --> FF[Starting System Selector]
    FF --> GG[Suitable System Finding]
    
    U --> HH[Seeded Random Generator]
    V --> HH
    W --> HH
    X --> HH
    Z --> HH
    AA --> HH
    
    subgraph "Game State Flow"
        II[New Game Event] --> JJ[Ship Selection]
        JJ --> KK[Starting System Setup]
        KK --> LL[Galaxy Exploration]
        LL --> MM[System Selection]
        MM --> NN[Exploration Events]
        NN --> OO[Stat Updates]
        OO --> PP[Market Interactions]
        PP --> QQ[Jump to New Systems]
        QQ --> LL
    end
    
    subgraph "Data Persistence"
        RR[Game Save Data]
        RR --> SS[Ship Stats]
        RR --> TT[Current System]
        RR --> UU[Explored Systems]
        RR --> VV[Travel History]
        RR --> WW[Galaxy Seed]
    end
```

```mermaid
sequenceDiagram
    participant User
    participant Index
    participant Hooks
    participant Utils
    participant LocalStorage
    
    User->>Index: Start New Game
    Index->>Utils: Generate Galaxy Seed
    Index->>Utils: Generate Ship Options
    Index->>User: Show Ship Selection
    User->>Index: Select Ship
    Index->>Hooks: Reset Ship Stats
    Index->>Utils: Find Starting System
    Index->>Hooks: Jump to System
    
    loop Exploration Loop
        User->>Index: Select System
        Index->>Hooks: Update Selection
        User->>Index: Begin Exploration
        Index->>Utils: Generate Exploration Event
        Index->>Hooks: Update Stats from Event
        Index->>User: Show Results
    end
    
    User->>Index: Save Game
    Index->>Hooks: Collect Game State
    Hooks->>LocalStorage: Store Save Data
    
    User->>Index: Load Game
    Index->>LocalStorage: Retrieve Save Data
    LocalStorage->>Hooks: Restore Game State
    Hooks->>Index: Update UI State
```