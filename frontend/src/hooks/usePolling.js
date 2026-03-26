import { useEffect, useRef } from 'react';

/**
 * Custom hook to handle periodic polling with cleanup.
 * @param {Function} callback - The function to call on each interval.
 * @param {number} delay - Delay in milliseconds (null to stop polling).
 */
export function usePolling(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}
