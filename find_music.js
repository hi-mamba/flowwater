import https from 'https';

const keyword = encodeURIComponent('不凡 凡人修仙传');
const options = {
  hostname: 'api.uomg.com',
  path: `/api/search.netease?keyword=${keyword}`,
  method: 'GET'
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', chunk => {
    body += chunk;
  });
  res.on('end', () => {
    console.log(body);
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
