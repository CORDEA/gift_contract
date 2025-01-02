import "@stdlib/deploy";
message Gift {
    to: Address;
}
message Tax {
    amount: Int as coins;
}
message TaxResult {
    tax: Int;
}
// 1 JPY = 0.001167 TON
const jpyRate: Int = ton("0.001167");

contract GiftContract with Deployable {
    agency: Address;
    init(){
        self.agency = sender();
    }

    receive(gift: Gift){
        send(SendParameters{to: gift.to, bounce: true, value: 0, mode: SendRemainingValue + SendIgnoreErrors});
    }

    receive(tax: Tax){
        let estimate = self.calculateTax(tax.amount);
        self.reply(TaxResult{tax: estimate}.toCell());
    }

    fun calculateTax(value: Int): Int {
        return self.getTaxRate(value);
    }

    fun getTaxRate(value: Int): Int {
        let jpy = value / jpyRate;
        return (jpy * 100) / 100;
    }
}
