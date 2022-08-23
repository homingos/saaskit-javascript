function useMessage() {

    function sendMessage(message: { type: string; payload?: any }) {
        parent.postMessage(message, "*")
    }

    return { sendMessage }
}

export default useMessage;