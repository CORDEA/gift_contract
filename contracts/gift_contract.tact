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
message CurrencyRate {
    rate: Int as coins;
}
contract GiftContract with Deployable {
    agency: Address;
    jpyRate: Int as coins;
    init(){
        self.agency = sender();
        self.jpyRate = ton("0");
    }

    receive(gift: Gift){
        send(SendParameters{to: gift.to, bounce: true, value: 0, mode: SendRemainingValue + SendIgnoreErrors});
    }

    receive(tax: Tax){
        let estimate = self.calculateTax(tax.amount);
        self.reply(TaxResult{tax: estimate}.toCell());
    }

    receive(currencyRate: CurrencyRate){
        require(sender() == self.agency, "Only agency can set currency rate");
        self.jpyRate = currencyRate.rate;
    }

    fun calculateTax(value: Int): Int {
        let jpy = value / self.jpyRate;
        let rate = self.getTaxRate(jpy);
        return value * rate / 100;
    }

    fun getTaxRate(jpy: Int): Int {
        if (jpy <= 10000000) {
            return 10;
        }
        if (jpy <= 30000000) {
            return 15;
        }
        if (jpy <= 50000000) {
            return 20;
        }
        if (jpy <= 100000000) {
            return 30;
        }
        if (jpy <= 200000000) {
            return 40;
        }
        if (jpy <= 300000000) {
            return 45;
        }
        if (jpy <= 600000000) {
            return 50;
        }
        return 55;
    }
}
