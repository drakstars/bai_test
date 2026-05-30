// import * as VueRouter from 'vue-router'
// import {RouteRecordRaw} from 'vue-router'
// import Layout from "@/layout/default.vue";
// import words from "@/pages/(words)/words.vue";
// import DictDetail from "@/pages/(words)/dict.vue";
// import DictList from "@/pages/(words)/dict-list.vue";
// import PracticeWords from "@/pages/(words)/practice-words/[id].vue";
// import WordTest from "@/pages/(words)/words-test/[id].vue";
//
// import articles from "@/pages/(articles)/articles.vue";
// import BookDetail from "@/pages/(articles)/book.vue";
// import BookList from "@/pages/(articles)/book-list.vue";
// import PracticeArticles from "@/pages/(articles)/practice-articles/[id].vue";
//
// import setting from "@/pages/setting.vue";
// import login from "@/pages/(user)/login.vue";
// import user from "@/pages/(user)/user.vue";
// import vip from "@/pages/(user)/vip.vue";
// import feedback from "@/pages/feedback.vue";
// import qa from "@/pages/help.vue";
// import doc from "@/pages/doc.vue";
// // import { useAuthStore } from "@/stores/user";
//
// export const routes: RouteRecordRaw[] = [
//   {
//     path: '/',
//     component: Layout,
//     children: [
//       {path: '/', redirect: '/words'},
//       {path: 'words', component: words},
//       {path: 'word', redirect: '/words'},
//       {path: 'practice-words/:id', component: PracticeWords},
//       {path: 'word-test/:id', component: WordTest},
//       {path: 'study-word', redirect: '/words'},
//       {path: 'dict-list', component: DictList},
//       {path: 'dict-detail', component: DictDetail},
//
//       {path: 'articles', component: articles},
//       {path: 'article', redirect: '/articles'},
//       {path: 'practice-articles/:id', component: PracticeArticles},
//       {path: 'study-article', redirect: '/articles'},
//       {path: 'book', component: BookDetail},
//       {path: 'book-list', component: BookList},
//
//       {path: 'login', component: login},
//       {path: 'user', component: user},
//       {path: 'vip', component: vip},
//
//       {path: 'setting', component: setting},
//       {path: 'feedback', component: feedback},
//       {path: 'qa', component: qa},
//       {path: 'doc', component: doc},
//     ]
//   },
//   {path: '/batch-edit-article', component: () => import("@/pages/(articles)/batch-edit-article.vue")},
//   {path: '/:pathMatch(.*)*', redirect: '/words'},
// ]
//
// const router = VueRouter.createRouter({
//   history: VueRouter.createWebHistory(import.meta.env.VITE_ROUTE_BASE),
//   // history: VueRouter.createWebHashHistory(),
//   routes,
//   scrollBehavior(to, from, savedPosition) {
//     // console.log('savedPosition', savedPosition)
//     if (savedPosition) {
//       return savedPosition
//     } else {
//       return {top: 0}
//     }
//   },
// })
//

// router.beforeEach(async (to: any, from: any) => {
//   return true
//
//   // const userStore = useAuthStore()
//   //

//   // const publicRoutes = ['/login', '/wechat/callback', '/user-agreement', '/privacy-policy']
//   //

//   // if (publicRoutes.includes(to.path)) {
//   //   return true
//   // }
//   //

//   // if (!userStore.isLoggedIn) {

//   //   const isInitialized = await userStore.initAuth()
//   //   if (!isInitialized) {
//   //     return {path: '/login', query: {redirect: to.fullPath}}
//   //   }
//   // }
//   //
//   // return true
//   // console.log('beforeEach-to',to.path)
//   // console.log('beforeEach-from',from.path)
//   // const runtimeStore = useRuntimeStore()
//   //

//   // let noAnimation = [
//   //   '/pc/practice',
//   //   '/pc/dict',
//   //   '/mobile',
//   //   '/'
//   // ]
//   //
//   // if (noAnimation.indexOf(from.path) !== -1 && noAnimation.indexOf(to.path) !== -1) {
//   //   return true
//   // }
//   //
//   // const toDepth = routes.findIndex(v => v.path === to.path)
//   // const fromDepth = routes.findIndex(v => v.path === from.path)
//   // // const fromDepth = routeDeep.indexOf(from.path)
//   //
//   // if (toDepth > fromDepth) {
//   //   if (to.matched && to.matched.length) {
//   //     let def = to.matched[0].components.default
//   //     let toComponentName = def.name ?? def.__name
//   //     runtimeStore.updateExcludeRoutes({type: 'remove', value: toComponentName})



//   //   }
//   // } else {
//   //   if (from.matched && from.matched.length) {
//   //     let def = from.matched[0].components.default
//   //     let fromComponentName = def.name ?? def.__name
//   //     runtimeStore.updateExcludeRoutes({type: 'add', value: fromComponentName})


//   //   }
//   // }
//   // ...

//   // return true
// })
//
//
// export default router