/*
消息界面路由容器组件
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { List, Badge } from 'antd-mobile'
import QueueAnim from 'rc-queue-anim'

const Item = List.Item
const Brief = Item.Brief
/*
对chatMsgs按chat_id进行分组, 并得到每个组的lastMsg组成的数组
1. 找出每个聊天的lastMsg, 并用一个对象容器来保存 {chat_id, lastMsg}
2. 得到所有lastMsg的数组
3. 对数组进行排序(按create_time降序)
 */
function getLastMsgs(chatMsgs, userid) {
  // 1. 找出每个聊天的lastMsg, 并用一个对象容器来保存 {chat_id:lastMsg}
  const lastMsgObjs = {}
  chatMsgs.forEach(msg => {
    // debugger
    // 对msg进行个体的统计
    if (msg.to === userid && !msg.read) {
      msg.unReadCount = 1
    } else {
      msg.unReadCount = 0
    }

    // 得到msg的聊天标识id
    const chatId = msg.chat_id
    // 获取已保存的当前组件的lastMsg
    let lastMsg = lastMsgObjs[chatId]
    // 没有
    if (!lastMsg) { // 当前msg就是所在组的lastMsg
      lastMsgObjs[chatId] = msg
    } else {// 有
      // 累加unReadCount=已经统计的 + 当前msg的
      const unReadCount = lastMsg.unReadCount + msg.unReadCount
      // 如果msg比lastMsg晚, 就将msg保存为lastMsg
      if (msg.create_time > lastMsg.create_time) {
        lastMsgObjs[chatId] = msg
      }
      //将unReadCount保存在最新的lastMsg上
      lastMsgObjs[chatId].unReadCount = unReadCount
    }
  })

  // 2. 得到所有lastMsg的数组
  const lastMsgs = Object.values(lastMsgObjs)

  // 3. 对数组进行排序(按create_time降序)
  lastMsgs.sort(function (m1, m2) { // 时间大的放前面，如果结果<0, 将m1放在前面, 如果结果为0, 不变, 如果结果>0, m2前面
    return m2.create_time - m1.create_time
  })
  console.log(lastMsgs)
  return lastMsgs
}

class Message extends Component {

  render() {
    const { user } = this.props
    const { users, chatMsgs } = this.props.chat

    // 对chatMsgs按chat_id进行分组
    const lastMsgs = getLastMsgs(chatMsgs, user._id)


    return (
      <List style={{ marginTop: 50, marginBottom: 50 }}>
        <QueueAnim type='scale'>
          {
            lastMsgs.map(msg => {
              // 得到目标用户的id
              const targetUserId = msg.to === user._id ? msg.from : msg.to
              // 得到目标用户的信息
              const targetUser = users[targetUserId]
              return (
                <Item
                  key={msg._id}
                  extra={<Badge text={msg.unReadCount} />}
                  thumb={targetUser.header ? require(`../../assets/images/${targetUser.header}.png`) : null}
                  arrow='horizontal'
                  onClick={() => this.props.history.push(`/chat/${targetUserId}`)}
                >
                  <Brief style={{ fontSize: 16, fontWeight: 900, color: 'black' }}>{targetUser.username}</Brief>
                  <div style={{ color: '#c5c3c3', fontSize: 14, }}>{msg.content}</div>

                </Item>
              )
            })
          }
        </QueueAnim>

      </List>
    )
  }
}

export default connect(
  state => ({ user: state.user, chat: state.chat }),
  {}
)(Message)
// chatMsgs: [
  // {
  //   read: false,
  //   _id: '637b798a18f02230400a9249',
  //   from: '635cecd470f36b46dc2c91a8',
  //   to: '635cf31eb0731d1980f464bd',
  //   content: 'asd',
  //   chat_id: '635cecd470f36b46dc2c91a8-635cf31eb0731d1980f464bd',
  //   create_time: 1669036426042
  // },
  // {
  //   read: false,
  //   _id: '637b79a618f02230400a924a',
  //   from: '635cecd470f36b46dc2c91a8',
  //   to: '635cf31eb0731d1980f464bd',
  //   content: 'afds',
  //   chat_id: '635cecd470f36b46dc2c91a8-635cf31eb0731d1980f464bd',
  //   create_time: 1669036454462
  // },