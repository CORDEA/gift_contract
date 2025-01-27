import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, toNano } from '@ton/core';
import { GiftContract, storeTaxResult } from '../wrappers/GiftContract';
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

    it('should set currency rate', async () => {
        const result = await giftContract.send(
            agency.getSender(),
            {
                value: toNano('0.01'),
            },
            {
                $$type: 'CurrencyRate',
                rate: toNano('0.0123')
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: agency.address,
            success: true,
        });
    });

    it('should calculate tax', async () => {
        const sender = await blockchain.treasury('sender');

        await giftContract.send(
            agency.getSender(),
            {
                value: toNano('0.01'),
            },
            {
                $$type: 'CurrencyRate',
                rate: toNano('0.001')
            }
        );
        const result = await giftContract.send(
            sender.getSender(),
            {
                value: toNano('0.01'),
            },
            {
                $$type: 'Tax',
                amount: toNano('0.05')
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: giftContract.address,
            to: sender.address,
            success: true,
            body: beginCell().store(
                storeTaxResult({
                    $$type: 'TaxResult',
                    tax: BigInt(5000000),
                })
            ).endCell(),
        });
    });
});
