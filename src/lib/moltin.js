import { gateway as MoltinGateway } from '@moltin/sdk';

const Moltin = MoltinGateway({
  client_id: process.env.MOLTIN_CLIENT_ID,
});

export default Moltin;
