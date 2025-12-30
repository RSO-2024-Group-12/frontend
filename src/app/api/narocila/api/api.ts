export * from './internalOrdersEndpoint.service';
import { InternalOrdersEndpointService } from './internalOrdersEndpoint.service';
export * from './userOrdersEndpoint.service';
import { UserOrdersEndpointService } from './userOrdersEndpoint.service';
export const APIS = [InternalOrdersEndpointService, UserOrdersEndpointService];
