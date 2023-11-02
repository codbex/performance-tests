/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint camelcase: "off"*/

import http from 'k6/http';
import { Options } from 'k6/options';
// @ts-ignore
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/2.4.0/dist/bundle.js';
// @ts-ignore
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import encoding from 'k6/encoding';
// @ts-ignore

const options: Options = {
    scenarios: {
        constantTraffic: {
            executor: 'constant-vus',
            vus: 10,
            duration: '90s',
            startTime: '0s',
        },
        spikeTraffic: {
            executor: 'ramping-vus',
            stages: [
                {
                    duration: '10s',
                    target: 25,
                },
                {
                    duration: '10s',
                    target: 50,
                },
                {
                    duration: '10s',
                    target: 90,
                },
            ],
            startTime: '30s',
        },
    },
    // thresholds: {
    //     http_req_failed: ['rate == 0.00'],
    //     http_req_duration: ['avg<1800', 'p(90)<2000', 'p(95)<2500', 'max<5000'],
    // },
    ext: {
        loadimpact: {
            distribution: {
                distributionLabel1: {
                    loadZone: 'amazon:de:frankfurt',
                    percent: 100,
                },
            },
        },
    },
};

const setup = () => {
    if (__ENV.APP_AUTH_OAUTH_ENABLED) {
        const response = http.post(__ENV.APP_AUTH_OAUTH_TOKEN_URL, {
            grant_type: 'client_credentials',
            client_id: __ENV.APP_AUTH_OAUTH_CLIENT_ID,
            client_secret: __ENV.APP_AUTH_OAUTH_CLIENT_SECRET,
        });

        const accessToken = response.json('access_token');
        return `Bearer ${accessToken}`;
    }

    const basicToken = encoding.b64encode(`${__ENV.APP_AUTH_BASIC_USERNAME}:${__ENV.APP_AUTH_BASIC_PASSWORD}`);
    return `Basic ${basicToken}`;
};

const performanceTest = (authorizationHeader: string) => {
    // http.get(`${__ENV.APP_HOST}/services/ts/application/hello-world.ts`, {
    // http.get(`${__ENV.APP_HOST}/services/js/application/hello-world-mjs.mjs`, {
    // http.get(`${__ENV.APP_HOST}/services/js/application/hello-world-js.js`, {
    // http.get(`${__ENV.APP_HOST}/services/ide/workspaces/workspace`, {
    http.get(`${__ENV.APP_HOST}/actuator/health`, {
        headers: {
            Authorization: authorizationHeader,
        }
    });
};

const handleSummary = (data: unknown) => {
    console.log('Finished executing performance tests');

    return {
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
        'summary.json': JSON.stringify(data),
        'summary.html': htmlReport(data),
    };
};

export default performanceTest;

export { handleSummary, options, setup };
