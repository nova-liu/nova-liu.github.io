<script setup>
import UserAvatar from '@/components/UserAvatar.vue'
import CardLink from '@/components/CardLink.vue'

const cards = [
  {
    id: 0,
    img: '/xiaoyuzhou.png',
    title: 'xiaoyuzhou',
    link: 'https://www.xiaoyuzhoufm.com/podcast/684bef00ba2d15e8af122e05',
  },
  {
    id: 1,
    img: '/bilibili.png',
    title: 'bilibili',
    link: 'https://space.bilibili.com/319717159/',
  },
  {
    id: 2,
    img: '/github.png',
    title: 'github',
    link: 'https://github.com/nova-liu',
  },
  {
    id: 3,
    img: '/redbook.png',
    title: 'red book',
    link: 'https://www.xiaohongshu.com/user/profile/5c21f0f7000000000700be21',
  },
  {
    id: 4,
    img: '/gmail.png',
    title: 'gmail',
    link: 'zhixizhixizhixi@gmail.com',
  },
]
const name = 'Nova Liu'
const avatar = '/jiji.jpeg'
const description = 'A backend developer, badminton and fitness enthusiast'
</script>

<template>
  <div class="home-view">
    <div class="avatar-container">
      <UserAvatar :name="name" :src="avatar" alt="avatar" :description="description" />
    </div>
    <div class="card-link-container">
      <CardLink :cards="cards" />
    </div>
  </div>
</template>

<style scoped>
.home-view {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  gap: 5rem;
  padding: 1rem;
  align-items: center;
}
</style>
