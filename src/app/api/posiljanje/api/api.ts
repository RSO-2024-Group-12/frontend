export * from './internalShipmentsEndpoint.service';
import { InternalShipmentsEndpointService } from './internalShipmentsEndpoint.service';
export * from './userShipmentsEndpoint.service';
import { UserShipmentsEndpointService } from './userShipmentsEndpoint.service';
export const APIS = [InternalShipmentsEndpointService, UserShipmentsEndpointService];
