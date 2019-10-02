import { RootStore } from "./rootStore";
import { observable, action, reaction } from "mobx";

export default class CommonStore {
    rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;

        // Set reaction to 'token' observable
        reaction(
            () => this.token, // what is being observed
            token => {        // setup the effect
                if (token) {
                    window.localStorage.setItem('jwt', token);
                } else {
                    window.localStorage.removeItem('jwt');
                }
            }
        );
    }

    @observable token: string | null = window.localStorage.getItem('jwt');
    @observable appLoaded = false;

    @action setToken = (token: string | null) => {
        //window.localStorage.setItem('jwt', token!);  // Note! This logic is already handled by the 'reaction'
        this.token = token;
    }

    @action setAppLoaded = () => {
        this.appLoaded = true;
    }

}