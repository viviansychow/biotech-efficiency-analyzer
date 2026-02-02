import { useState } from "react"

export const useFetch = (url) => {
    const [ data, setData ] = useState(null)
    const [ loading, setLoading] = useState(false)
    const [ error, setError ] = useState(null)

    const clearData = () => {
        setData(null)
        setError(null)
    }

    const performFetch = async (options = {}) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify(options.body)
            });

            if(!response.ok) {
               throw new Error(`"Server Error": ${response.status}`);
            }

            // if (!response.ok) {
            //     // Try to get the error message from the backend JSON first
            //     const errorData = await response.json().catch(() => ({})); 
            //     console.log("errData===>", errorData)
            //     const message = errorData.error || `Server Error: ${response.status}`;
            //     throw new Error(message);
            // }

            const result = await response.json();

            setData(result)

            return result

        } catch(e) {
            if(e.message === "Failed to fetch") {
                setError("Cannot connect to server.")
            } else {
                setError(e.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return {data, loading, error, performFetch, clearData }
}