import Url from 'url-parse';
import AbstractIndexer from '@js/Search/Indexer/AbstractIndexer';
import PasswordStatisticsService from "@js/Services/PasswordStatisticsService";
import IndexEntry from "@js/Models/Search/IndexEntry";
import shoetest from "shoetest";

export default class PasswordIndexer extends AbstractIndexer {

    constructor() {
        super();
        this._textIndexFields = ['label', 'username', 'notes'];
        this._genericIndexFields = ['shared', 'favorite', 'hidden', 'password', 'status', 'statusCode'];
    }

    /**
     *
     * @param {Password} password
     * @return {IndexEntry}
     */
    indexItem(password) {
        return this._createIndex(password);
    }

    /**
     *
     * @param {Password} password
     * @return {IndexEntry}
     * @private
     */
    _createIndex(password) {
        let entry = new IndexEntry(password.getId(), 'password', password.isHidden());

        this._addStatisticsData(password, entry);
        this._indexServer(password, entry);
        this._indexTextFields(password, entry);
        this._indexFields(password, entry);
        this._indexUrl(password, entry);
        this._indexFolder(password, entry);
        this._indexCustomFields(password, entry);

        entry.clean();

        return entry;
    }

    /**
     *
     * @param {Password} password
     * @param {IndexEntry} entry
     * @private
     */
    _addStatisticsData(password, entry) {
        let usageData = PasswordStatisticsService.getPasswordUses(password.getId());

        entry.setField('uses', [usageData.total])
            .setBoost('uses', usageData.total);

        for (let domain in usageData.domains) {
            entry.addFieldValue('host', domain)
                .addFieldValue(domain, usageData.domains[domain])
                .setBoost(domain, usageData.domains[domain]);
        }
    }

    /**
     *
     * @param {Password} password
     * @param {IndexEntry} entry
     * @private
     */
    _indexCustomFields(password, entry) {
        let customFields = password.getCustomFields();
        for (let customField of customFields) {
            if (!customField.getValue() || customField.getValue().length === 0) continue;

            if (customField.getType() === 'text' || customField.getType() === 'email') {
                let value = customField.getValue().toLowerCase(),
                    field = customField.getLabel().toLowerCase();

                entry.addFieldValue('text', shoetest.simplify(value))
                    .addFieldValue(field, value);
            } else if (customField.getType() === 'url') {
                let value = customField.getValue().toLowerCase(),
                    model = new Url(value);

                entry.addFieldValue('url', value)
                    .addFieldValue('host', model.host)
                    .addFieldValue('text', shoetest.simplify(model.host));
            }
        }
    }

    /**
     *
     * @param {Password} password
     * @param {IndexEntry} entry
     * @private
     */
    _indexFolder(password, entry) {
        let value = password.getFolder();
        if (value && value.length !== 0) {
            entry.addFieldValue('folder', value);
        }
    }

    /**
     *
     * @param {Password} password
     * @param {IndexEntry} entry
     * @private
     */
    _indexUrl(password, entry) {
        let url = password.getUrl();
        if (url && url.length !== 0) {
            let value = url.toLowerCase(),
                model = new Url(value);

            entry.addFieldValue('url', value)
                .addFieldValue('host', model.host)
                .addFieldValue('text', shoetest.simplify(model.host));
        }
    }
}