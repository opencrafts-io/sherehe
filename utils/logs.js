// Create logs
const logs = (durationMicroseconds, level, clientIp, method, msg, path, status, userAgent) => {
  const timestamp = new Date().toISOString();
  console.log({timestamp,level,client_ip: clientIp,duration: `${durationMicroseconds}μs`,method,msg,path,status,user_agent: userAgent,});

}

export { logs };