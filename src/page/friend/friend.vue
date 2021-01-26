<template>
	<div class="content">
		<div class="friend-wrapper">
			<search></search>
      <friendlist></friendlist>
		</div>
		<div class="friendinfo">
      <winbar/>
			<info></info>
		</div>
	</div>
</template>

<script>
import search from '../../components/search/search'
import friendlist from '../../components/friendlist/friendlist'
import info from '../../components/info/info'
import winbar from '../../components/winbar';
export default{
    components: {
        search,
        friendlist,
        info,
        winbar
    }
}
</script>

<style lang="stylus" scoped>
.content
  display: flex
  width: 100%
  height: 100%
  .friend-wrapper
    width: 250px
    background: #fff
  .friendinfo
    flex: 1
</style>