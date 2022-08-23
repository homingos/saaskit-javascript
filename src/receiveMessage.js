export default function receiveMessage(event) {
    if (event.origin == 'http://localhost:3000') {
        console.log('event listened', event);

        switch (event.data.type) {
            case 'close':
                this.closeModal();
        }
    }
};
