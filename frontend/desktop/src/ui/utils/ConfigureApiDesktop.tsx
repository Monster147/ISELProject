import {configureApi} from "@commons/api/api";
import {authInfoRepo} from "../infrastructure/AuthInfoPreferencesRepo";

configureApi({
    getAuthInfo: () => authInfoRepo.getAuthInfo(),
});