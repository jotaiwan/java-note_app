// App.js 变得非常简洁，只做“渲染”这一件事
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import routes from './routes'; // 导入上方的配置

function App() {
  return (
    <Router>
      {/* Suspense 只需一个，用于包裹所有懒加载组件 */}
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {
            // 动态遍历 routes 配置，生成 Route
            routes.map(({ path, component: Component }) => (
              <Route
                key={path} // key 使用 path 即可
                path={path}
                element={<Component />}
              />
            ))
          }
          {/* 404 路由保持不变 */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;