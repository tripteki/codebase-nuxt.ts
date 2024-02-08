"use strict";

import moment from "moment";

export default () =>
{
    const configuration = useRuntimeConfig ();

    const instance = moment ();

    instance.locale (configuration.public.language);
    instance.format ('DD-MM-YYYYY hh:mm:ss');

    return instance;
};
