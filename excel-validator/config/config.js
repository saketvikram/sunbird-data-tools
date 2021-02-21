const CONFIG = {
  // CSVPATH: '/Users/saket/Documents/question-create/cg/maths-10/maths-10.csv',
  CSVPATH: '/Users/vaibhav/Documents/CG PHASE 2/Math class 1/Math Class 1.csv',
  Q_IMAGE_PATH: '/Users/vaibhav/Documents/CG PHASE 2/Math class 1/',
  O_IMAGE_PATH: '/Users/vaibhav/Documents/CG PHASE 2/Math class 1/',
  TOTAL_OPTIONS: 4,
  BASE_URL: 'https://diksha.gov.in/api/',
  PRIVATE_BASE_URL: 'https://diksha.gov.in/api/private/',
  SUB_PATH_V3: {
    CONTENT: 'content/v3/',
    ASSESSMENT: 'action/assessment/v3/items/'
  },
  SUB_PATH: {
    USERS: 'user/v1/',
    CONTENT: 'content/v1/',
    SEARCH: 'composite/v1/'
  },
  APIS: {
    SEARCH: 'search/',
    HIERARCHY: 'hierarchy/'
  },
  API_KEY: 'Bearer <API_KEY>'
};
module.exports = CONFIG;
