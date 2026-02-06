// DOM patch for Google Translate compatibility
// This file patches DOM methods BEFORE React uses them
// Must be imported early in the application

if (typeof window !== 'undefined') {
    // Use a more aggressive patching approach that React can't bypass
    const patchKey = '__googleTranslatePatched';
    
    // Patch removeChild
    if (!(Node.prototype.removeChild as any)[patchKey]) {
        const originalRemoveChild = Node.prototype.removeChild;
        
        const patchedRemoveChild = function(this: Node, child: Node) {
            try {
                // Check if child is actually a child before removing
                if (child.parentNode !== this) {
                    // Child's parent is not this node - it was moved, return without error
                    return child;
                }
                // Child is actually a child - proceed with normal removal
                return originalRemoveChild.call(this, child);
            } catch (error) {
                // Catch any errors and return child silently
                const err = error as { name?: string; code?: number; message?: string };
                const errorMessage = err?.message || String(error) || '';
                const errorName = err?.name || '';
                const errorCode = err?.code;
                
                if (
                    errorName === 'NotFoundError' ||
                    errorCode === 8 ||
                    errorMessage.includes('not a child') ||
                    errorMessage.includes('removeChild') ||
                    errorMessage.includes('Failed to execute')
                ) {
                    return child;
                }
                throw error;
            }
        };
        
        // Replace the function
        Object.defineProperty(Node.prototype, 'removeChild', {
            value: patchedRemoveChild,
            writable: true,
            enumerable: false,
            configurable: true
        });
        
        (Node.prototype.removeChild as any)[patchKey] = true;
    }

    // Patch insertBefore
    if (!(Node.prototype.insertBefore as any)[patchKey]) {
        const originalInsertBefore = Node.prototype.insertBefore;
        
        const patchedInsertBefore = function(this: Node, newNode: Node, referenceNode: Node | null) {
            try {
                // Check if referenceNode is actually a child of this node (if provided)
                if (referenceNode !== null && referenceNode.parentNode !== this) {
                    // Reference node was moved - append instead
                    return this.appendChild(newNode);
                }
                // Reference node is valid - proceed with normal insertion
                return originalInsertBefore.call(this, newNode, referenceNode);
            } catch (error) {
                const err = error as { name?: string; code?: number; message?: string };
                const errorMessage = err?.message || String(error) || '';
                const errorName = err?.name || '';
                const errorCode = err?.code;
                
                if (
                    errorName === 'NotFoundError' ||
                    errorCode === 8 ||
                    errorMessage.includes('not a child') ||
                    errorMessage.includes('insertBefore') ||
                    errorMessage.includes('Failed to execute')
                ) {
                    // Fallback to appendChild
                    try {
                        return this.appendChild(newNode);
                    } catch {
                        return newNode;
                    }
                }
                throw error;
            }
        };
        
        // Replace the function
        Object.defineProperty(Node.prototype, 'insertBefore', {
            value: patchedInsertBefore,
            writable: true,
            enumerable: false,
            configurable: true
        });
        
        (Node.prototype.insertBefore as any)[patchKey] = true;
    }
    
    // Also add global error handlers as a fallback
    if (typeof window !== 'undefined' && !(window as any).__googleTranslateErrorHandlerAdded) {
        const handleError = (event: ErrorEvent) => {
            const errorMessage = event.error?.message || event.message || '';
            const isDOMError = 
                errorMessage.includes('removeChild') ||
                errorMessage.includes('insertBefore') ||
                errorMessage.includes('not a child of this node') ||
                errorMessage.includes('Failed to execute \'removeChild\'') ||
                errorMessage.includes('Failed to execute \'insertBefore\'');
            
            if (isDOMError) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const errorMessage = event.reason?.message || String(event.reason) || '';
            const isDOMError = 
                errorMessage.includes('removeChild') ||
                errorMessage.includes('insertBefore') ||
                errorMessage.includes('not a child of this node') ||
                errorMessage.includes('Failed to execute \'removeChild\'') ||
                errorMessage.includes('Failed to execute \'insertBefore\'');
            
            if (isDOMError) {
                event.preventDefault();
            }
        };

        window.addEventListener('error', handleError, true);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        (window as any).__googleTranslateErrorHandlerAdded = true;
    }
}

