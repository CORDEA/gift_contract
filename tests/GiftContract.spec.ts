import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { GiftContract } from '../wrappers/GiftContract';
import '@ton/test-utils';

describe('GiftContract', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let giftContract: SandboxContract<GiftContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        giftContract = blockchain.openContract(await GiftContract.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await giftContract.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: giftContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and giftContract are ready to use
    });
});
