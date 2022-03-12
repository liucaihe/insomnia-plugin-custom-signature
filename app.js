const MD5 = require('md5')

module.exports.templateTags = [{
  name: 'Signature',
  displayName: 'API Custom Signature',
  description: 'Newlink API Custom Signature verification',

  async run (context) {
    const { meta } = context
    // 获取 Secret
    let Secret = context.context.API_SECRET
    if (!meta.requestId || !meta.workspaceId) {
      return null
    }

    // 获取请求ID
    const request = await context.util.models.request.getById(meta.requestId)

    // 获取请求参数
    let requestParams = request.parameters

    let params = []
    let strs = ''

    for (let index of requestParams) {
      // 排除 sign 参数及 insomnia 未选中的参数
      if (index.name === 'sign' || index.disabled) continue
      params.push({
        name: await context.util.render(index.name),
        value: await context.util.render(index.value)
      })
    }

    // 按参数名称进行排序
    params.sort((a, b) => {
      let A = a.name
      let B = b.name
      if (A < B) { return -1 }
      if (A > B) { return 1 }
      return 0
    })

    // 将所有的参数名和参数值拼接成字符串
    params.forEach((item) => {
      strs += item.name + ((item.value === null || item.value === undefined) ? '' : item.value)
    })

    // 将 Secret 拼接到字符串开始和末尾
    strs = Secret + strs.trim() + Secret

    // 将字符串进行MD5加密并返回
    return MD5(strs).toLowerCase()
  }
  
}]
