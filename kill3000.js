const execSync = require("child_process").execSync;

const exec = async (command) => {
  const responce = await execSync(command, { encoding: "utf-8" });
  return responce;
};

exec("lsof -t -i:3000")
  .then((pid) => exec(`kill -9 ${pid}`))
  .catch(() => {});
