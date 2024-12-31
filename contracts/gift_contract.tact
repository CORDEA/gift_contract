import "@stdlib/deploy";
message Gift {
    to: Address;
}

contract GiftContract with Deployable {
    agency: Address;
    init(){
        self.agency = sender();
    }

    receive(gift: Gift){
        send(SendParameters{to: gift.to, bounce: true, value: 0, mode: SendRemainingValue + SendIgnoreErrors});
    }
}
