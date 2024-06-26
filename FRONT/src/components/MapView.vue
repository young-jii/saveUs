<template>
    <div class="map-view">
        <div id="controls">
            <div class="control-item">
                <label for="startAddress">출발지</label>
                <input type="text" id="startAddress" v-model="localStartPoint">
            </div>
            <div class="control-item">
                <label for="endAddress">도착지</label>
                <input type="text" id="endAddress" v-model="localEndPoint">
            </div>
            <button @click="findRoute">길찾기</button>
        </div>
        <div id="results">
            <h3>🧭 경로를 선택하세요! 🧭</h3>
            <div class="route-list-box">
                <ul class="route-list">
                    <li v-for="(route, index) in routes" :key="index" class="route-data">
                        <div class="route_con" @click="onRouteClick(route)">
                            <div class="route_time_header">[총 소요 시간] {{ formatTime(route.totalTime) }}</div>
                            <div class="route_time">
                                <span class="info_sub">
                                    <span>환승 {{ route.subwayTransitCount + route.busTransitCount - 1 }}회 | </span>
                                    <span>{{ route.payment }}원 | </span>
                                    <span>{{ (route.totalDistance / 1000).toFixed(1) }}km</span>
                                </span>
                            </div>
                            <div class="route_bar">
                                <span 
                                    v-for="(subPath, subIndex) in route.subPaths" 
                                    :key="subIndex"
                                    :class="['bar_area', getTrafficClass(subPath, true)]"
                                    :style="{ flexBasis: `${subPath.sectionTime * 100}%`, minWidth: '6.5%' }"
                                >
                                    <span class="bar">
                                        <span class="time">{{ subPath.sectionTime }}분</span>
                                    </span>
                                </span>
                            </div>
                            <div class="route_detail">
                                <ul class="route-detail-list">
                                    <li v-for="(subPath, subIndex) in filteredSubPaths(route.subPaths)" :key="subIndex" class="line">
                                        <span class="icon" :class="getTrafficClass(subPath)"></span>
                                        <span class="r_body">
                                            <span class="r_action">{{ getAction(subPath, subPath.startName, subPath.lane) }}</span>
                                        </span>
                                    </li>
                                    <li :key="route.subPaths.length" class="line">
                                        <span class="icon"></span>
                                        <span class="r_body">
                                            <span class="r_title"> ➜ {{ route.lastEndStation }} 하차</span>
                                        </span>
                                    </li>
                                </ul>
                                <div class="maker" style="display: none;">powered by<em>www.ODsay.com</em></div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <img :src="odsayLogo" alt="ODsay Logo" />
        <div id="map"></div>
    </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { EventBus } from '../../eventBus.js';
import { axiosInstance } from '../assets/js/MapView.js';  // Import axiosInstance
// import CustomAlert from '../components/CustomAlert.vue';
import MapView from '../assets/js/MapView.js';
import odsayLogo from '../assets/img/ODsay_bi_mark.png';

export default {
    components: {
        // CustomAlert
    },
    props: {
        memHome: String,
        startPoint: String,
        endPoint: String,
        memYoungY: Boolean,
        memYoungN: Boolean,
        memSubsidiaryYn: Boolean
    },
    setup(props) {
        const store = useStore();
        const localStartPoint = ref(props.startPoint);
        const localEndPoint = ref(props.endPoint);
        const routes = ref([]);
        const map = ref(null);
        const polylines = ref([]);
        const alert = ref(null);

        const findRoute = async () => {
            await MapView.methods.findRoute.call({
                geocode: MapView.methods.geocode,
                showAlert: MapView.methods.showAlert,
                localStartPoint: localStartPoint.value,
                localEndPoint: localEndPoint.value,
                routes: routes,
                $odsayAxios: axiosInstance // axiosInstance가 미리 정의되어 있어야 합니다.
            });
        };

        const initializeMap = () => {
            MapView.methods.initializeMap.call({
                map: map.value,
                showAlert: MapView.methods.showAlert,
                polylines: polylines
            });
        };

        const handleRouteSelection = (route) => {
            MapView.methods.handleRouteSelection.call({
                map: map.value,
                clearPolylines: MapView.methods.clearPolylines,
                drawNaverMarker: MapView.methods.drawNaverMarker,
                drawNaverPolyLine: MapView.methods.drawNaverPolyLine,
                polylines: polylines,
                $odsayAxios: axiosInstance // axiosInstance가 미리 정의되어 있어야 합니다.
            }, route);
        };

        const onRouteClick = (route) => {
            console.log('onRouteClick method called in MapView.vue');
            store.dispatch('setSelectedRoute', route);
        };

        onMounted(async () => {
            initializeMap();
            await findRoute();
            // alert.value = MapView.methods.$refs.CustomAlert;
            EventBus.on('route-selected', handleRouteSelection);
        });

        onBeforeUnmount(() => {
            EventBus.off('route-selected', handleRouteSelection);
        });

        return {
            localStartPoint,
            localEndPoint,
            routes,
            map,
            polylines,
            alert,
            findRoute,
            onRouteClick,
            odsayLogo,
            ...MapView.methods
        };
    }
};
</script>

<style scoped src="../assets/css/MapView.css"></style>