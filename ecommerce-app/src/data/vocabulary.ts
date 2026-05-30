export interface Word {
  id: string;
  word: string;
  phonetic: string;
  definition: string;
  example: string;
  exampleTranslation: string;
}

export interface Dictionary {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: string;
  words: Word[];
}

export const DICTIONARIES: Dictionary[] = [
  {
    id: "it-vocab",
    name: "Từ vựng Chuyên ngành IT",
    description: "Các thuật ngữ công nghệ thông tin phổ biến nhất dành cho lập trình viên.",
    icon: "💻",
    level: "Trung cấp",
    words: [
      {
        id: "it-1",
        word: "algorithm",
        phonetic: "/ˈæl.ɡə.rɪ.ðəm/",
        definition: "thuật toán, quy trình giải quyết vấn đề",
        example: "The algorithm optimizes the search results.",
        exampleTranslation: "Thuật toán tối ưu hóa kết quả tìm kiếm."
      },
      {
        id: "it-2",
        word: "database",
        phonetic: "/ˈdeɪ.tə.beɪs/",
        definition: "cơ sở dữ liệu",
        example: "All user records are stored in the database.",
        exampleTranslation: "Tất cả hồ sơ người dùng được lưu trữ trong cơ sở dữ liệu."
      },
      {
        id: "it-3",
        word: "framework",
        phonetic: "/ˈfreɪm.wɜːk/",
        definition: "khung làm việc, bộ mã nguồn mẫu",
        example: "Next.js is a popular React framework.",
        exampleTranslation: "Next.js là một khung làm việc React phổ biến."
      },
      {
        id: "it-4",
        word: "compilation",
        phonetic: "/ˌkɒm.pɪˈleɪ.ʃən/",
        definition: "quá trình biên dịch mã nguồn",
        example: "The compilation failed due to a syntax error.",
        exampleTranslation: "Quá trình biên dịch thất bại do lỗi cú pháp."
      },
      {
        id: "it-5",
        word: "repository",
        phonetic: "/rɪˈpɒz.ɪ.tər.i/",
        definition: "kho lưu trữ mã nguồn (repo)",
        example: "Clone the repository to your local machine.",
        exampleTranslation: "Clone kho lưu trữ về máy cục bộ của bạn."
      },
      {
        id: "it-6",
        word: "asynchronous",
        phonetic: "/eɪˈsɪŋ.krə.nəs/",
        definition: "bất đồng bộ",
        example: "JavaScript handles asynchronous tasks using promises.",
        exampleTranslation: "JavaScript xử lý các tác vụ bất đồng bộ bằng promise."
      },
      {
        id: "it-7",
        word: "middleware",
        phonetic: "/ˈmɪd.əl.weər/",
        definition: "phần mềm trung gian",
        example: "The middleware verifies user tokens.",
        exampleTranslation: "Phần mềm trung gian xác thực token người dùng."
      },
      {
        id: "it-8",
        word: "concurrency",
        phonetic: "/kənˈkʌr.ən.si/",
        definition: "tính đồng thời, chạy song song",
        example: "Go handles concurrency extremely well.",
        exampleTranslation: "Ngôn ngữ Go xử lý tính đồng thời cực kỳ tốt."
      }
    ]
  },
  {
    id: "ielts-vocab",
    name: "Từ vựng IELTS High-Band",
    description: "Bộ từ vựng học thuật nâng cao giúp nâng band điểm IELTS Writing và Speaking.",
    icon: "🎓",
    level: "Nâng cao",
    words: [
      {
        id: "ielts-1",
        word: "ubiquitous",
        phonetic: "/juːˈbɪk.wɪ.təs/",
        definition: "phổ biến, có mặt ở khắp mọi nơi",
        example: "Smartphones are ubiquitous in modern society.",
        exampleTranslation: "Điện thoại thông minh xuất hiện ở khắp mọi nơi trong xã hội hiện đại."
      },
      {
        id: "ielts-2",
        word: "mitigate",
        phonetic: "/ˈmɪt.ɪ.ɡeɪt/",
        definition: "giảm thiểu, làm dịu bớt hậu quả",
        example: "Measures were taken to mitigate environmental damage.",
        exampleTranslation: "Các biện pháp đã được thực hiện để giảm thiểu thiệt hại môi trường."
      },
      {
        id: "ielts-3",
        word: "pragmatic",
        phonetic: "/præɡˈmæt.ɪk/",
        definition: "thực tế, thực dụng",
        example: "We need to take a pragmatic approach to this problem.",
        exampleTranslation: "Chúng ta cần có một cách tiếp cận thực tế cho vấn đề này."
      },
      {
        id: "ielts-4",
        word: "corroborate",
        phonetic: "/kəˈrɒb.ə.reɪt/",
        definition: "xác minh, làm chứng cớ chứng minh",
        example: "Witnesses corroborated his alibi.",
        exampleTranslation: "Nhân chứng đã xác minh bằng chứng ngoại phạm của anh ta."
      },
      {
        id: "ielts-5",
        word: "superfluous",
        phonetic: "/suːˈpɜː.flu.əs/",
        definition: "thừa thãi, không cần thiết",
        example: "Avoid using superfluous words in your essay.",
        exampleTranslation: "Tránh sử dụng những từ ngữ thừa thãi trong bài luận."
      },
      {
        id: "ielts-6",
        word: "adversity",
        phonetic: "/ədˈvɜː.sə.ti/",
        definition: "nghịch cảnh, sự bất hạnh",
        example: "She showed great courage in the face of adversity.",
        exampleTranslation: "Cô ấy đã thể hiện lòng dũng cảm to lớn khi đối mặt với nghịch cảnh."
      }
    ]
  },
  {
    id: "toeic-vocab",
    name: "Từ vựng TOEIC Công sở",
    description: "Từ vựng giao tiếp thương mại và công sở thường gặp trong đề thi TOEIC.",
    icon: "💼",
    level: "Cơ bản - Trung cấp",
    words: [
      {
        id: "toeic-1",
        word: "negotiate",
        phonetic: "/nəˈɡəʊ.ʃi.eɪt/",
        definition: "đàm phán, thương lượng",
        example: "We managed to negotiate a better discount.",
        exampleTranslation: "Chúng tôi đã thương lượng được mức giảm giá tốt hơn."
      },
      {
        id: "toeic-2",
        word: "reimburse",
        phonetic: "/ˌriː.ɪmˈbɜːs/",
        definition: "hoàn tiền, bồi hoàn chi phí",
        example: "The company will reimburse your travel expenses.",
        exampleTranslation: "Công ty sẽ hoàn lại chi phí đi lại của bạn."
      },
      {
        id: "toeic-3",
        word: "delegate",
        phonetic: "/ˈdel.ɪ.ɡət/",
        definition: "ủy quyền, giao phó công việc",
        example: "A good manager knows how to delegate tasks.",
        exampleTranslation: "Một nhà quản lý giỏi biết cách giao phó công việc."
      },
      {
        id: "toeic-4",
        word: "procurement",
        phonetic: "/prəˈkjʊə.mənt/",
        definition: "sự thu mua thiết bị, vật tư",
        example: "She is in charge of office supply procurement.",
        exampleTranslation: "Cô ấy chịu trách nhiệm thu mua văn phòng phẩm."
      },
      {
        id: "toeic-5",
        word: "itinerary",
        phonetic: "/aɪˈtɪn.ər.ər.i/",
        definition: "lịch trình chuyến đi",
        example: "I will send you the itinerary for the business trip.",
        exampleTranslation: "Tôi sẽ gửi cho bạn lịch trình của chuyến đi công tác."
      }
    ]
  }
];

export const getDictionaryById = (id: string): Dictionary | undefined => {
  return DICTIONARIES.find((d) => d.id === id);
};
