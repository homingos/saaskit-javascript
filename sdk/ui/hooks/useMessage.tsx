function useMessage() {

    function sendMessage(message: {type: string; payload?: any}) {
        console.log("Hello")
        parent.postMessage(message, "*")
    }

    return {sendMessage} 
}

export default useMessage;