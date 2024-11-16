import request from 'request';
import rp from 'request-promise';
import config from '../config/config.json';

export class CaspioHelper {
    async getAccessToken() {
        return new Promise(function (resolve, rejected) {
            request({
                url: `${config.caspio.baseUrl}/oauth/token`,
                method: 'POST',
                form: {
                    grant_type: config.caspio.grandType,
                    client_id: config.caspio.clientId,
                    client_secret: config.caspio.clientSecret,
                },
            }, 
            async (err, resCaspio) => {
                if (err || resCaspio.statusCode != 200) {
                    if (err) {
                        rejected(err);
                    }
                    else {
                        if (resCaspio && resCaspio.body && resCaspio.body.Message) {
                            rejected(resCaspio.body.Message);
                        }
                        else {
                            rejected(resCaspio.statusMessage);
                        }
                    }
                }
                const resJsn = JSON.parse(resCaspio.body);
                let tokenData = resJsn;
                let currentDate = new Date();
                tokenData.expires_in = currentDate.setSeconds(currentDate.getSeconds() + tokenData.expires_in);
                tokenData.name = "caspio";
                resolve(resJsn.access_token);
            });
        });
    }

    async get(ressource, ressource_name, query, token) {
        let options = {
            url: `${config.caspio.baseUrl}/rest/v2/${ressource}/${ressource_name}/records?${query}`,
            method: 'get',
            json: true,
            auth: {
                'bearer': token
            }
        }

        let response = await rp(options);
        if (response.Result) {
            return response.Result;
        }

        return [];
    }

    async getAll(ressource, ressource_name, query, token){
        let queryResult = [];
        let allRecords = [];
        
        let pageNumber = 1;
        do{
            let pageQuery = query+`&q.pageNumber=${pageNumber}&q.pageSize=1000`;
            queryResult = await this.get(ressource, ressource_name, pageQuery, token);
            allRecords = allRecords.concat(queryResult);
            pageNumber+=1;
            
        }while(queryResult && queryResult.length === 1000)
        return allRecords;
    }

    async deactivateItem(token, tableName, id) {
        let options = {
            method: 'put',
            json: true,
            headers: {
                'content-type': 'application/json',
                'accept': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: { 'Active_YN': 'false' },
            url: `${config.caspio.baseUrl}/rest/v2/tables/${tableName}/records?q.where=Record_ID%3D'` + id + `'`,
            auth: {
                'bearer': token
            }
        }
        let response = await rp(options);
        return response;
    }

    async put(resource, ressource_name, query, data_for_update, token) {
        try {
            let options = {
                url: `${config.caspio.baseUrl}/rest/v2/${resource}/${ressource_name}/records?response=rows&${query}`,
                method: 'put',
                json: data_for_update,
                auth: {
                    'bearer': token
                }
            }

            let response = await rp(options);
            console.info(JSON.stringify(response));
            return response;
        }
        catch (err) {
            console.error(JSON.stringify(err));
            return false;
        }
    }

    async post(resource, ressource_name, data, token) {
        let options = {
            url: `${config.caspio.baseUrl}/rest/v2/${resource}/${ressource_name}/records?response=rows`,
            method: 'post',
            json: data,
            auth: {
                'bearer': token
            }
        }

        let response = await rp(options);
        return response && response.Result && (response.Result.length > 0) ? response.Result[0] : null;
    }

    async deleteRows(resource, ressource_name, query, token) {
        let options = {
            url: `${config.caspio.baseUrl}/rest/v2/${resource}/${ressource_name}/records?${query}`,
            method: 'delete',
            auth: {
                'bearer': token
            }
        }

        let response = await rp(options);

        console.log(response);
        return response;
    }

    async runTask(token, taskId) {
        let options = {
            url: `${config.caspio.baseUrl}/rest/v2/tasks/${taskId}/run`,
            method: 'post',
            auth: {
                'bearer': token
            }
        }
    
        let response = await rp(options);
        return response;
    }

}
export default new CaspioHelper();
