// lib/event-emitter.ts

// Define the event detail interface
export interface TransactionUpdateDetail {
    timestamp: Date;
  }
  
  /**
   * Emits a custom event to indicate that transactions have been updated
   * This allows different components to react to transaction changes
   */
  export function emitTransactionUpdated(): void {
    if (typeof window === 'undefined') return;
    
    // Create and dispatch a custom event
    const event = new CustomEvent('transaction-updated', {
      bubbles: true,  // Allow event to bubble up through the DOM
      cancelable: false, // Event cannot be canceled
      detail: {
        timestamp: new Date()
      } as TransactionUpdateDetail
    });
    
    // Dispatch event on window to ensure global availability
    window.dispatchEvent(event);
    
    console.log('Transaction update event emitted', event.detail);
  }
  
  /**
   * Subscribe to transaction update events
   * @param {Function} callback - Function to call when a transaction is updated
   * @returns {Function} - Function to call to unsubscribe
   */
  export function subscribeToTransactionUpdates(
    callback: (detail: TransactionUpdateDetail) => void
  ): () => void {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    
    if (typeof window === 'undefined') {
      // Return a no-op function for SSR
      return () => {};
    }
    
    // Create event handler that calls the callback
    const handleEvent = (event: Event) => {
      const customEvent = event as CustomEvent<TransactionUpdateDetail>;
      callback(customEvent.detail);
    };
    
    // Add event listener
    window.addEventListener('transaction-updated', handleEvent);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('transaction-updated', handleEvent);
    };
  }