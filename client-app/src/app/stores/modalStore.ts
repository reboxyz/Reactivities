import { RootStore } from "./rootStore";
import { observable, action } from "mobx";

export default class ModalStore {
    rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    // Note! Since body will be pointing to an object, we should set the observable as 'shallow'
    // which in effect only observe the 'first' level and not the whole object/component pointed by 'body'
    @observable.shallow modal = {
        open: false,
        body: null      // Component to be displayed in Modal
    }

    @action openModal = (content: any) => {
        this.modal.open = true;
        this.modal.body = content;
    }

    @action closeModal = () => {
        this.modal.open = false;
        this.modal.body = null;
    }

}