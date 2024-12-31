import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { GiftContract } from '../wrappers/GiftContract';
import '@ton/test-utils';

describe('GiftContract', () => {
    let blockchain: Blockchain;
    let agency: SandboxContract<TreasuryContract>;
    let giftContract: SandboxContract<GiftContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        giftContract = blockchain.openContract(await GiftContract.fromInit());

        agency = await blockchain.treasury('agency');

        const deployResult = await giftContract.send(
            agency.getSender(),
            {
                value: toNano('0.01'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: agency.address,
            to: giftContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        const sender = await blockchain.treasury('sender');
        const receiver = await blockchain.treasury('receiver');

        const result = await giftContract.send(
            sender.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Gift',
                to: receiver.address
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: giftContract.address,
            to: receiver.address,
            success: true,
        });
    });
});
