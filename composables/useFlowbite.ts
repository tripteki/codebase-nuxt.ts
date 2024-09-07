"use strict";

export default (callback: any): void =>
{
    if (process.client) {

        import ('flowbite').then ((flowbite) =>
        {
            callback (flowbite);
        });
    }
};
