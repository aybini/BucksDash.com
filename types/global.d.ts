declare global {
  interface Window {
    Plaid: {
      create: (config: any) => {
        open: () => void
        exit: (callback: () => void) => void
      }
    }
  }
}

export {}
