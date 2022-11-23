# 1.用户注册成功登录页面解析
    在用户注册选择对应laoban 或者大神后，就会发送register请求，如果请求失败，则提示此用户已存在之类的，如果请求成功，那么后端会返回对应的数据，有id，type，name，password，因为不可以返回密码，所以需要解构返回回来时剔除掉password，然后前端收到type,username,_id三个值，此时在actions中，授权成功的同步action，dispatch(authSuccess(result.data))，然后再reducer中拿到对应的值，并且重定向成功后跳转的页面路由，这里进行判断，如果有header也就是头像名称就跳首页，否则跳到完善信息页面，这里有大神和老板两个页面，再util中定义函数实现这个路径重定向，然后在页面中读取redirectTo中的值来判断是否跳转
    ``` vue
    const {msg,redirectTo} = this.props.user
    if(redirectTo){
      return <Redirect to={redirectTo}/>
    }
    ```

# 2.发送异步请求步骤

    首先在ajax中封装好请求，
    第一步、在action-types.js中定义常量
        ``` vue
        export const RECEIVE_USER = 'receive_user'//接收用户
        export const RESET_USER = 'reset_user'//重置用户
        ```
    第二步、在action中引入常量和封装得请求函数
        ```vue
        import {
            RECEIVE_USER,
            RESET_USER
        } from './actions-types'
        import {
            reqUpdateUser
        } from '../api'
        ```
    第三步，action中定义同步action，设置好对象，将type类型放入，方便reducer中switch中进行判断
    ```vue 
            // 接收用户得同步action
            const receiveUser = (user) =>({type:RECEIVE_USER,data:user})
            // 重置用户得同步action
            const resetUser = (msg) => ({type:RESET_USER,data:msg})
        ```
    第四步、action中写请求，请求成功后将返回的值对应dispatch提交到reducers中（这里默认带着类型，也就是上方定义好的type）
        ``` vue
            // 更新用户异步action
            export const updateUser = (user) =>{
                return async dispatch =>{
                    const response = await reqUpdateUser(user)
                    const result = response.data
                    if(result.code === 0){ //更新成功:data
                        dispatch(receiveUser(result.data))
                    }else{ //更新失败，msg
                        dispatch(resetUser(result.msg))
                    }
                }
            }
    ```
    第五步、reducer中,引入常量用来在函数中类型判断;定义共享的数据initUser，然后进行action传入的参数对应修改
            ```vue 
                import {
                    RECEIVE_USER,
                    RESET_USER
                } from './actions-types'

                const initUser = {
                    username:'', //用户名
                    type:'', //用户类型 dashen/laoban
                    msg:'', //错误提示信息
                    redirectTo:'' // 需要自动重定向的路由路径
                }

                function user(state=initUser,action){
                    switch (action.type){
                        case RECEIVE_USER:
                            return action.data
                        case RESET_USER:
                            return {...initUser,msg:action.data}   
                        default:
                            return state
                    }
                }
        ```
        第五步、在组件中使用,先从actions中引入login函数，然后在connect中传入login方法，就可以用this.props获取到，然后去调用这个函数，传对应参数就可
        ``` vue 
        import { login } from '../../redux/actions'

        export default connect(
                state => ({user:state.user}),
                {login}
        )(Login)

        <Button type='primary' onClick={this.login}>登&nbsp;&nbsp;录</Button>

        login =() =>{
                this.props.login(this.state)
        }
        ```

# 3.自动登录功能解析
    1. 实现自动登陆:
        引入插件 ：import Cookies from 'js-cookie'  // 可以操作前端cookie的对象 set()/get()/remove()
    2. componentDidMount()
        登陆过(cookie中有userid), 但没有有登陆(redux管理的user中没有_id) 发请求获取对应的user:
        ``` vue 
                const userid = Cookies.get('userid')
                const {_id} = this.props.user //redux中获取的id
                if(userid && !_id) {
                    // 发送异步请求, 获取user
                    // console.log('发送ajax请求获取user')
                    this.props.getUser()
                }
        
        ```
    3. render()
        1). 如果cookie中没有userid, 直接重定向到login
        ``` vue
                const userid = Cookies.get('userid')
                if(!userid) {
                    return <Redirect to='/login'/>
                }
        ```
        2). 判断redux管理的user中是否有_id, 如果没有, 暂时不做任何显示
        3). 如果有, 说明当前已经登陆, 显示对应的界面

        4). 如果请求根路径: 根据user的type和header来计算出一个重定向的路由路径, 并自动重定向
        ``` vue
                let path =  this.props.location.pathname
                if(path==='/'){
                    // 得到一个重定向的路由路径
                    path = getRedirectTo(user.type,user.header)
                    return <Redirect to={path}/>
                }
          ```

# 4.底部导航栏实现
    1.引入组件 
        import { NavBar } from 'antd-mobile'
    2.定义数组 navList存放4个标签：分别为老板，大神，消息，个人中心
    ```vue
        {
            path: '/laoban', // 路由路径
            component: Laoban, //引入组件名称
            title: '大神列表', //头部标题
            icon: 'dashen', //图标名字
            text: '大神', //图标下文字
        },
    ```
    3.得到数组中与路由匹配的对象
    ```vue
        const {navList} = this
        const path = this.props.location.pathname //请求的路径
        const currentNav = navList.find(nav=>nav.path === path) //得到当前的nav，可能没有
    ```
    4.然后进行过滤，添加hide属性，将其设置为true
    ```vue
        if(currentNav){
        // 决定哪个路由需要隐藏
        if(user.type === 'laoban'){
            // 隐藏数组的第2个
            navList[1].hide = true
        }else{
            // 隐藏数组的第一个
            navList[0].hide = true
        }
        }
    ```
    5.在components中nav-footer组件中
    ```vue
         let {navList} = this.props
        // 过滤掉hide为true的nav
        navList = navList.filter(nav => !nav.hide)
        //在return中用map渲染出来，用common.js的方式引入当前文件夹下的对应图片
         navList.map((nav) => ( 
                <Item   key={nav.path} 
                        icon={{uri: require(`./images/${nav.icon}.png`)}} 
                        selectedIcon={{uri: require(`./images/${nav.icon}-selected.png`)}}
                        selected={path===nav.path}
                        onPress={() => this.props.history.replace(nav.path)}
                        title={nav.text}/>
            ))
    ```

# 6.聊天实现
 ## 1.http协议是攻守方浏览器一直是攻，所以现在改成ws：协议，将其设置为平等等级，所以使用`Websocket`
    后台准备：新建一个socketIO/test.js
        // socket.emit('receiveMsg', data) // 是单独的发送
           io.emit('receiveMsg', data)   //是全局发送，有多少个客户端就都发
 ## 2.跨域问题
    客户端：下载socket.io-client和socket.io
    服务端：
         1） 下载 cros，在app.js中引入
            const cors = require('cors')
            // 配置跨域
            app.use(cors({credentials:true,origin:true}))
        2） 在写的io文件上写入
            var io = require('socket.io')(server, { cors: true });
## 3.展示聊天页面
    1） `main.jsx` 中定义好路由组件
        <Route path='/chat/:userid' component={Chat} />
    2）老板列表循环中加入点击事件，`params` 携带对方id，进入chat页面
        <Card onClick={() => this.props.history.push(`/chat/${user._id}`)}>
    3）chat.jsx 接收到两个数据
    【  user，
        chat:users: {}, // 所有用户信息的对象  属性名: userid, 属性值是: {username, header}
             chatMsgs: [], // 当前用户所有相关msg的数组
    】
    //获取chatId
        const chatId = [meId, targetId].sort().join('-')
    // 对chatMsgs进行过滤，过滤出只有这两个用户的聊天记录
        const msgs = chatMsgs.filter(msg => msg.chat_id === chatId)
    //然后判断谁发给谁的，对应显示消息
        if (targetId === msg.from) {// 对方发给我的
## 4.发送消息功能
    1） 给输入框绑定onChange，让state中可以实时获取到用户输入值
        onChange={val => this.setState({ content: val })}
    2）在 `chat.jsx` 中定义发送按钮事件，发送from，to，content三个参数，
         const from = this.props.user._id
        const to = this.props.match.params.userid
        const content = this.state.content.trim()
        // 发送请求(发消息)
        if (content) {
            //sendMsg是利用socket.io进行emit提交，后端on监听
            this.props.sendMsg({ from, to, content })
        }
    3） 后端监听到消息，保存消息到数据库中，并定义好chat_id，是两个用户聊天拼接的统一id
         // 绑定监听, 接收客户端发送的消息
      socket.on('sendMsg', function ({from,to,content}) {
        console.log('服务器接收到客户端发送的消息', {from,to,content})
        const chat_id =[from,to].sort().join('-') // from_to或to_from
        const create_time = Date.now()
        new ChatModel({from,to,content,chat_id,create_time}).save(function(error,chatMsg){
            io.emit('receiveMsg',chatMsg) //给客户端返回刚才用户发送的消息
        })
    4） 发送完消息后输入框设为空
        输入框绑定value值为state中的content，然后发送完监听后，将content值设为null
    5) 发送消息展示到聊天页面
        1. 接收到服务端emit提交的receiveMsg，然后在action中监听并分发同步action，修改对应
            io.socket.on('receiveMsg', function (chatMsg) {
                // 只有当chatMsg是与当前用户相关的消息, 才去分发同步action
                if(userid===chatMsg.from || userid===chatMsg.to) {
                    dispatch(receiveMsg(chatMsg, userid))
                    }
            })
        2. 在reducer中修改消息列表值，将加好的第一条消息添加进receiveMsgList中
            case RECEIVE_MSG: //data:chatMsg
                const chatMsg = action.data
            return {
                users:state.users, //user还是原来的user
                chatMsgs:[...state.chatMsgs,chatMsg], //添加进后面
                unReadCount:0
            }
        3.组件中reducer改变会自动更新状态，从而展示出来刚才所发的消息
## 5.消息列表显示
    1) 在redux中已经获取到了所有的与此用户相关的聊天信息记录，然后利用sort()进行排序，将大的时间放前面，也就是说用户刚聊完天的用户会出现在消息列表的置顶，然后获取出来一个所有当前用户与其他用户的最后时间聊天记录，
    
    2)  设置格式一个对象筛选出来最后数据 lastMsgObjs= {{chat_id:lastMsg}，{chat_id:lastMsg}....}，
        ``筛选方式`` ，第一次进来直接将值赋值，第二次后进行循环比较，如果id存在，比较值的创建时间，大的则覆盖，小的则不变
                if (!lastMsg) { // 当前msg就是所在组的lastMsg
                    lastMsgObjs[chatId] = msg
                }else { 
                if (msg.create_time > lastMsg.create_time) {
                    lastMsgObjs[chatId] = msg
                }}
    
    3)  然后使用Object.values(lastMsgObjs)拿到对应id的所有value值得一个所有用户最后一次消息数组,
    4)  其中有未读消息数，循环进行判断里面read状态是否为false，如果是的话，设置一个属性unReadCount为1，不是的话为0，
            // 对msg进行个体的统计
            if (msg.to === userid && !msg.read) {
            msg.unReadCount = 1
            } else {
            msg.unReadCount = 0
            }
    然后进入第二次循环，如果id还是相同，那么将设置的值和原未读值相加，保存到我们的lastMsgObjs上
            // 累加unReadCount=已经统计的 + 当前msg的
            const unReadCount = lastMsg.unReadCount + msg.unReadCount
            //将unReadCount保存在最新的lastMsg上
            lastMsgObjs[chatId].unReadCount = unReadCount
    这样就通过循环的方式，把每一个当前用于与其他用户聊天的最后未读数汇总在一起，重而显示出每个用户消息未读数
    
    5） 然后在渲染dom中遍历循环，循环条件如下：
         // 得到目标用户的id，便于展示对方的头像和名称
            const targetUserId = msg.to === user._id ? msg.from : msg.to
        // 得到目标用户的信息
            const targetUser = users[targetUserId]

## 6.底部总的未读消息展示
   bug: 原来放在页面中mounted进行更新，当用户之间聊天，发了消息，退出来还是有未读数量得显示，所以将其改到componentWillUnmount () { // 在退出之前更新，这样不管是a还是b用户，都可以去消除这个聊天未读数量

   实现：
    1） 在api定义请求，传入from（对方id）
            // 修改指定消息为以读
            export const reqReadMsg = (from) => ajax('readmsg',{from},'POST')

    2）在后台获取自己的id，然后更新from里面的read参数
            const to = req.cookies.userid
            ChatModel.update({from, to, read: false}, {read: true}, {multi: true}, function (err,   doc) {
                console.log('/readmsg', doc)
                res.send({code: 0, data: doc.nModified}) // 更新的数量
            })
    3）redux中步骤实现
        1.actions-types.js定义常量 export const MSG_READ = 'msg_read' // 查看过了某个聊天消息
        2.action.js
            // 读取了某个聊天消息的同步action
            const msgRead = ({count, from, to}) => ({type: MSG_READ, data: {count, from, to}})
            // 读取消息的异步action
            export const readMsg = (from, to) => {
                return async dispatch => {
                const response = await reqReadMsg(from)
                const result = response.data
                if(result.code===0) {
                    const count = result.data
                    dispatch(msgRead({count, from, to}))
                }
                }
            }
        3.reducer.js修改参数
            //定义总的未读数
            const initChat = {
                    users: {}, // 所有用户信息的对象  属性名: userid, 属性值是: {username, header}
                    chatMsgs: [], // 当前用户所有相关msg的数组
                    unReadCount: 0 // 总的未读数量
                }
            在接收消息列表类型中：利用reduce循环累加，得到总数
                unReadCount: chatMsgs.reduce((preTotal, msg) => preTotal + (!msg.read && msg.to === userid ? 1 : 0), 0)
            接收单个消息中，RECEIVE_MSG，单个增加数量
                unReadCount: state.unReadCount + (!chatMsg.read && chatMsg.to === action.data.userid ? 1 : 0)
            查看过某个用户的聊天记录，将chat中对应聊天信息中未读的false改为true，未读数减去后台返回更新数量     MSG_READ
                state.chatMsgs.forEach(msg => {
                    if (msg.from === from && msg.to === to && !msg.read) {
                            msg.read = true
                        }
                    })
                unReadCount: state.unReadCount-count
    4）聊天页面修改未读数功能实现
            1.引入readMsg异步action
            import { sendMsg ,readMsg} from '../../redux/actions'，
            2.退出页面时发请求更新消息的未读状态
                componentWillUnmount () { // 在退出之前
                    // 发请求更新消息的未读状态
                    const from = this.props.match.params.userid
                    const to = this.props.user._id
                    this.props.readMsg(from, to)
                }
    5）. 实现底部组件未读数
        首先在main最大的组件中获取到redux中的unReadCount
            state => ({user:state.user, unReadCount: state.chat.unReadCount}),
        传入到底部组件
            <NavFooter navList={navList} unReadCount={unReadCount}/>
        限制传入参数类型，因为不是路由组件，所有需要import {withRouter} from 'react-router-dom'包裹
            static propTypes = {
                navList: PropsTypes.array.isRequired,
                unReadCount: PropsTypes.number.isRequired
            }
        在对应路由展示
            badge={nav.path==='/message' ? unReadCount : 0}
