import { Capacitor } from "@capacitor/core";
import { capacitorJsApi } from "./capcitorJsApi";
import { electronJsApi } from "./electronJsApi";
import { IJsApi } from "./IJsApi";

const jsApi: IJsApi = Capacitor.getPlatform() === 'android' ?  capacitorJsApi : electronJsApi;
export { jsApi };