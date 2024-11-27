import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const baseUrl = "https://rickandmortyapi.com/api";
const getApi = () => ({
  characters: `${baseUrl}/character`,
  locations: `${baseUrl}/location`,
  episodes: `${baseUrl}/episode`
});

export const getContactsDuration = new Trend('get_contacts', true);  
export const RateContentOK = new Rate('content_OK');  

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.12'],  
    get_contacts: ['p(95)<5700'],  
    content_OK: ['rate>0.95']  
  }, 
  stages: [
    { duration: '30s', target: 5 },   
    { duration: '30s', target: 5 },  
    { duration: '30s', target: 5 },  
    { duration: '30s', target: 5 },  
    { duration: '30s', target: 10 },  
    { duration: '30s', target: 50 },  
    { duration: '30s', target: 50 },  
    { duration: '30s', target: 80 },  
    { duration: '1m', target:  80 } 
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  
  const api = getApi();
  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${api.characters}`);  

  
  getContactsDuration.add(res.timings.duration);

  
  RateContentOK.add(res.status === OK);

  
  check(res, {
    'GET Episodes - Status 200': () => res.status === OK
  });
}
