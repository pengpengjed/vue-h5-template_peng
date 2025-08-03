/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/',
    component: () => import('@/views/layouts/index'),
    redirect: '/home',
    meta: {
      title: '首页',
      keepAlive: false
    },
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/home/index'),
        meta: { title: '首页', keepAlive: false }
      },
      {
        path: '/about',
        name: 'About',
        component: () => import('@/views/home/about'),
        meta: { title: '关于我', keepAlive: false }
      },
      {
        path: '/trainingApplicationProxyByIfly',
        name: 'trainingApplicationProxyByIfly',
        component: () => import('@/views/trainingApplicationProxyByIfly/index.vue'),
        meta: { title: '训练申请', keepAlive: false }
      },
      {
        path: '/AccessCondition',
        name: 'AccessCondition',
        component: () => import('@/views/trainingApplicationProxyByIfly/AccessCondition.vue'),
        meta: { title: '训练申请', keepAlive: false }
      }
    ]
  }
]
