'use client';

// This component loads the DOM patch immediately when the client bundle loads
// It must be imported early to patch DOM methods before React uses them
import '@/lib/domPatch';

export default function DomPatchLoader() {
    // This component doesn't render anything, it just ensures the patch is loaded
    return null;
}

