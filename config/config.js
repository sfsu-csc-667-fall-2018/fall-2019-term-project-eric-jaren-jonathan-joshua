require('dotenv').config();

module.exports = {
<<<<<<< HEAD
  "development": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres"
  },
  "tests": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres"
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres"
  }
}
=======
    "development": {
        "use_env_variable": "DATABASE_URL",
        "dialect": "postgres"
    },

    "test": {
        "use_env_variable": "DATABASE_URL",
        "dialect": "postgres"
    },

    "production": {
        "use_env_variable": "DATABASE_URL",
        "dialect": "postgres"
    }
}
>>>>>>> 8e9d81269afc1db386a0b8a10503a4217d92a5fe
