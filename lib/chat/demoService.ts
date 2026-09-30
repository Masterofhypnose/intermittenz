import type {PublicProfile} from '../contracts/modules';
import {createDemoAdapter} from './demoAdapter';
export function createDemoChatService({viewer={id:'demo-viewer',displayName:'Camille Démo'},pageSize=2}:{viewer?:PublicProfile;pageSize?:number}={}){return createDemoAdapter(viewer.id,viewer.displayName,pageSize);}
