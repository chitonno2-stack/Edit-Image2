import React from 'react';
import { WorkMode, ModeInfo, AiProvider } from './types';
import Icon from './components/Icon';

export const AI_MODELS: Record<AiProvider, { value: string; label: string }[]> = {
  [AiProvider.GEMINI]: [
    { value: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image' }
  ],
  [AiProvider.OPENAI]: [
    { value: 'dall-e-3', label: 'DALL-E 3 (Chất lượng cao)' },
    { value: 'dall-e-2', label: 'DALL-E 2 (Hỗ trợ sửa vùng)' },
  ],
};

export const WORK_MODES: ModeInfo[] = [
  {
    id: WorkMode.PORTRAIT,
    name: 'Chế Độ Chân Dung',
    icon: (
      <Icon>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </Icon>
    ),
    description: 'Chỉnh sửa, làm đẹp, thay đổi phong cách cho ảnh chân dung.'
  },
  {
    id: WorkMode.RESTORE,
    name: 'Chế Độ Phục Chế',
    icon: (
      <Icon>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.47 2.118L2.25 12.87a2.25 2.25 0 0 1 2.47-2.118a3 3 0 0 0 5.78-1.128l1.158 6.112zM21.75 12.87a2.25 2.25 0 0 1-2.47 2.118a3 3 0 0 0-5.78 1.128l1.158-6.112a3 3 0 0 0 5.78-1.128 2.25 2.25 0 0 1 2.47-2.118L19.5 16.122z" />
        </svg>
      </Icon>
    ),
    description: 'Khôi phục ảnh cũ, mờ, hỏng.'
  },
  {
    id: WorkMode.CREATIVE,
    name: 'Chế Độ Siêu Phàm',
    icon: (
      <Icon>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.452-2.452L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.452-2.452L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.452 2.452L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.452 2.452Z" />
        </svg>
      </Icon>
    ),
    description: 'Thay đổi bối cảnh và mở rộng toàn thân nhân vật siêu thực.'
  },
  {
    id: WorkMode.COMPOSITE,
    name: 'Chế Độ Lồng Ghép',
    icon: (
      <Icon>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      </Icon>
    ),
    description: 'Ghép chủ thể vào một nền mới một cách siêu thực.'
  }
];

export const PROMPT_SUGGESTIONS: Record<WorkMode, string[]> = {
  [WorkMode.PORTRAIT]: [
    "Áp dụng ánh sáng studio chuyên nghiệp",
    "Tạo vẻ ngoài điện ảnh cổ điển",
    "Nhấn mạnh cấu trúc xương hàm",
    "Thêm tàn nhang tự nhiên",
    "Chuyển thành ảnh vẽ nghệ thuật",
    "Làm da mịn màng nhưng vẫn giữ chi tiết",
    "Tăng cường độ sáng cho mắt",
    "Tạo hiệu ứng tóc bay trong gió",
    "Chuyển ảnh sang tông màu đen trắng nghệ thuật",
    "Thêm một nụ cười nhẹ nhàng, tự nhiên"
  ],
  [WorkMode.RESTORE]: [
    "Khôi phục 100% chi tiết gốc",
    "Tái tạo bối cảnh chính xác như thật",
    "Làm rõ từng biểu cảm trên khuôn mặt",
    "Đảm bảo màu sắc chân thực theo lịch sử",
    "Phục chế kết cấu quần áo, vật dụng",
    "Loại bỏ các vết nứt và gấp trên ảnh",
    "Tăng độ sắc nét cho các chi tiết bị mờ",
    "Khử nhiễu hạt (grain) từ phim cũ",
    "Chỉnh lại màu sắc bị phai theo thời gian",
    "Tái tạo các vùng bị mất của ảnh"
  ],
  [WorkMode.CREATIVE]: [
    "Thay nền thành studio xám khói",
    "Đặt chủ thể vào một khu vườn Nhật Bản",
    "Tạo bối cảnh đường phố New York về đêm",
    "Hoàn thiện nhân vật, mặc vest đen lịch lãm",
    "Vẽ tiếp phần thân, mặc váy dạ hội đỏ",
    "Tạo dáng đứng toàn thân tự tin",
    "Thay nền thành một thư viện cổ kính",
    "Đặt chủ thể trên một bãi biển lúc hoàng hôn",
    "Ghép vào bối cảnh thành phố cyberpunk",
    "Đứng trên nóc một tòa nhà chọc trời",
    "Trong một khu rừng huyền bí có đom đóm",
    "Hoàn thiện nhân vật, mặc một bộ áo dài trắng",
    "Vẽ tiếp phần thân, mặc áo khoác da và quần jean",
    "Tạo dáng ngồi trên một chiếc ghế bành sang trọng",
    "Thêm một cây đàn guitar vào tay nhân vật",
    "Vẽ toàn thân, đang đi dạo trên phố"
  ],
  [WorkMode.COMPOSITE]: [
    "Đặt chủ thể lên đỉnh núi tuyết",
    "Tích hợp vào cảnh đường phố Tokyo về đêm",
    "Tạo ảnh ghép siêu thực",
    "Đặt chủ thể vào khung cảnh dưới nước",
    "Ghép chủ thể vào một cảnh trong phim khoa học viễn tưởng",
    "Tạo hiệu ứng người tí hon trong một khu vườn",
    "Đặt chủ thể ngồi trên mặt trăng",
    "Pha trộn với một bức tranh sơn dầu cổ điển",
    "Tạo ảnh phản chiếu trong một vũng nước"
  ],
};

export const HAIR_STYLE_SUGGESTIONS: string[] = [
  "Tóc bob ngắn hiện đại",
  "Tóc pixie cá tính",
  "Tóc lob ngang vai",
  "Tóc dài gợn sóng tự nhiên",
  "Tóc xoăn xù mì",
  "Tóc tết kiểu Pháp",
  "Tóc búi cao thanh lịch",
  "Tóc đuôi ngựa buộc cao",
  "Tóc nhuộm ombre",
  "Tóc highlight balayage",
  "Tóc mullet phá cách",
  "Tóc uốn cụp cổ điển",
  "Tóc duỗi thẳng mượt mà",
  "Tóc tết thác nước",
  "Tóc nhuộm màu pastel",
  "Tóc cạo một bên (sidecut)",
  "Tóc dreadlock",
  "Tóc bob bất đối xứng",
  "Tóc uốn sóng lơi Hàn Quốc",
  "Tóc búi natra",
];

export const MAKEUP_STYLE_SUGGESTIONS: string[] = [
  "Tông nude tự nhiên",
  "Mắt khói quyến rũ",
  "Môi đỏ cổ điển",
  "Tông cam đất năng động",
  "Phong cách Hàn Quốc (trong veo)",
  "Má hồng say rượu",
  "Eyeliner mắt mèo sắc sảo",
  "Tàn nhang giả nghệ thuật",
  "Môi căng mọng (glossy)",
  "Phong cách Douyin",
  "Trang điểm dự tiệc lấp lánh",
  "Kẻ mắt màu neon",
  "Phong cách Gothic",
  "Lông mày rậm tự nhiên",
  "Môi màu mận chín",
  "Trang điểm đơn sắc",
  "Mắt nhũ kim tuyến",
  "Phong cách Châu Âu sắc nét",
  "Môi xí muội",
  "Da căng bóng (glass skin)",
];

export const BACKGROUND_SUGGESTIONS: string[] = [
  "Studio tối giản với phông xám khói",
  "Căn phòng áp mái ấm cúng với ánh nắng chiều",
  "Đường phố Tokyo về đêm, ánh đèn neon rực rỡ",
  "Quán cà phê mang phong cách cổ điển Paris",
  "Thư viện cổ kính với những kệ sách cao tới trần",
  "Bãi biển nhiệt đới hoang sơ lúc hoàng hôn",
  "Khu vườn Nhật Bản với hồ cá koi và cầu gỗ",
  "Trên nóc một tòa nhà chọc trời ở New York",
  "Bối cảnh cyberpunk, thành phố tương lai",
  "Rừng rậm Amazon huyền bí, ánh sáng xuyên qua tán lá",
  "Cung điện hoàng gia sang trọng, kiến trúc baroque",
  "Nội thất phi thuyền không gian khoa học viễn tưởng",
  "Con hẻm nhỏ ở Hội An với đèn lồng và tường vàng",
  "Cánh đồng hoa oải hương ở Provence, Pháp",
  "Một con đường tuyết rơi ở châu Âu",
  "Bên trong một nhà kính đầy cây xương rồng",
  "Khung cảnh sa mạc hùng vĩ với các cồn cát",
  "Phòng trưng bày nghệ thuật hiện đại",
  "Ngồi trên một chiếc ngai vàng mang phong cách Gothic",
  "Sân khấu với ánh đèn rọi và rèm nhung đỏ",
  "Phòng điều khiển công nghệ cao, nhiều màn hình",
  "Bối cảnh phim noir, thành phố mưa và bóng tối",
  "Cánh đồng lúa bậc thang ở Sapa",
  "Bên cạnh một chiếc xe hơi thể thao cổ điển",
  "Phòng thí nghiệm khoa học với các dụng cụ thủy tinh",
  "Lâu đài băng giá trong truyện cổ tích",
  "Chợ nổi trên sông Mekong",
  "Đứng giữa một vòng tròn đá cổ xưa như Stonehenge",
  "Bối cảnh steampunk với máy móc và bánh răng",
  "Hành lang khách sạn sang trọng, đối xứng",
  "Trong một khu rừng phát quang sinh học vào ban đêm",
  "Bối cảnh Ngày Tận thế, thành phố đổ nát",
  "Quán bar nhạc jazz mờ ảo ở New Orleans",
  "Cảnh quan siêu thực, hành tinh xa lạ",
  "Vườn thượng uyển của một cung điện Trung Hoa",
  "Sân bóng rổ đường phố với tranh graffiti",
  "Bên trong một ngôi đền Ai Cập cổ đại",
  "Phòng khiêu vũ lộng lẫy với đèn chùm pha lê",
  "Đứng trên một vách đá nhìn ra biển",
  "Bối cảnh miền Tây hoang dã với saloon gỗ",
];