import os from 'os';

// Each exported async function becomes a callable action from your frontend via useSend().
// The function name is the action name: send('getInfo') calls getInfo() here.

// Optional lifecycle hooks:
// export async function onLoad(api: import('../condenser-app/shared/plugin').BackendAPI) {}
// export async function onUnload() {}

export async function getInfo() {
  return {
    platform: os.platform(),
    uptime: os.uptime(),
    memory: os.freemem(),
  };
}
