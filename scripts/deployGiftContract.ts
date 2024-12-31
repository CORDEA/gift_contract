import { toNano } from '@ton/core';
import { GiftContract } from '../wrappers/GiftContract';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const giftContract = provider.open(await GiftContract.fromInit());

    await giftContract.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(giftContract.address);

    // run methods on `giftContract`
}
