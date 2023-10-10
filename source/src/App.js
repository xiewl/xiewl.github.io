import "./App.css";
import { message, FloatButton, Input, Radio, Table } from "antd";
import { useMemo, useRef, useState } from "react";

const { Search } = Input;

function App() {
  const [allData, setAllData] = useState(
    localStorage.getItem("allData")
      ? JSON.parse(localStorage.getItem("allData"))
      : {},
  );
  const itemHeightRef = useRef(0);

  const dataSource = useMemo(() => {
    let arr = [];
    let errorChain = [];
    for (let i = 1; i <= 101; i++) {
      const hasError = /error/.test(JSON.stringify(allData[i]));
      if (hasError) {
        if (!errorChain.length || errorChain.at(-1) + 1 === i) {
          errorChain.push(i);
        }
      } else {
        if (errorChain.length) {
          arr.push({
            index:
              errorChain.length > 1
                ? `${errorChain[0]}-${errorChain.at(-1)}`
                : errorChain[0],
            errorChain: true,
          });
          errorChain.length = 0;
        }
        arr.push({ index: i });
      }
    }
    if (errorChain.length) {
      arr.push({
        index:
          errorChain.length > 1
            ? `${errorChain[0]}-${errorChain.at(-1)}`
            : errorChain[0],
        errorChain: true,
      });
      errorChain.length = 0;
    }
    return arr;
  }, [allData]);

  const renderSelect = (type, record) => {
    const { index, errorChain } = record;
    return (
      <Radio.Group
        disabled={errorChain}
        options={[
          { value: "success", label: "T" },
          { value: "error", label: "F" },
          { value: "null", label: "N", disabled: type === "6" },
        ]}
        value={errorChain ? "error" : allData[index]?.[type]}
        onChange={(e) => {
          // 拿单条高度
          if (!itemHeightRef.current) {
            itemHeightRef.current =
              document.querySelector(".ant-table-row")?.clientHeight;
          }
          if (index === 101) {
            document.documentElement.scrollTop = 0;
          } else if (e.target.value !== "error") {
            document.documentElement.scrollTop += itemHeightRef.current;
          }

          setAllData((originData) => {
            const replaceIndex = {
              ...originData[index],
              [type]: e.target.value,
            };
            const afterData = { ...originData, [index]: replaceIndex };
            localStorage.setItem("allData", JSON.stringify(afterData));
            return afterData;
          });
        }}
        optionType="button"
        buttonStyle="solid"
      />
    );
  };

  const columns = [
    {
      title: "序列",
      dataIndex: "index",
      render: (index, record) => {
        let color = "";
        for (let k in allData[index]) {
          if (allData[index][k] === "error") {
            color = "red";
            break;
          }
          if (allData[index][k] === "success") {
            color = "yellowgreen";
            break;
          }
        }
        if (record.errorChain) color = "red";
        return (
          <div
            style={{
              backgroundColor: color,
              padding: "8px 0",
              textAlign: "center",
              fontSize: 18,
            }}
          >
            {index}
          </div>
        );
      },
    },
    {
      title: "⭐ x6",
      dataIndex: "6",
      render: (_, record) => renderSelect("6", record),
    },
    {
      title: "⭐ x5",
      dataIndex: "5",
      render: (_, record) => renderSelect("5", record),
    },
    {
      title: "⭐ x4",
      dataIndex: "4",
      render: (_, record) => renderSelect("4", record),
    },
    {
      title: "建议",
      width: 70,
      dataIndex: "suggest",
      render: (_, record) => {
        if (record.errorChain) {
          if (/-/.test(record.index)) {
            return `垫${
              record.index.split("-")[1] - record.index.split("-")[0] + 1
            }次`;
          } else {
            return "垫1次";
          }
        }
        let matchStar;
        for (let k = 4; k <= 6; k++) {
          if (allData[record.index]?.[k] === "success") {
            matchStar = k;
            break;
          }
        }
        if (matchStar) return `熔${matchStar}星`;
        return `待测试`;
      },
    },
  ];

  return (
    <div id="container">
      <div style={{ margin: "10px" }}>
        <Search
          placeholder="输入序列号清除，输入all则清除全部"
          enterButton="清除数据"
          size="large"
          onSearch={(index) => {
            if (index === "all") {
              message.success(`全部序列清除成功`);
              localStorage.removeItem("allData");
              setAllData({});
            } else if (/^\d+$/.test(index)) {
              message.success(`序列${index}清除成功`);
              setAllData((originData) => {
                const afterData = { ...originData, [index]: {} };
                localStorage.setItem("allData", JSON.stringify(afterData));
                return afterData;
              });
            }
          }}
        />
      </div>
      <Table
        rowKey="index"
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="middle"
      />
      <FloatButton.Group
        shape="circle"
        style={{
          left: 15,
          bottom: 15,
        }}
      >
        <FloatButton
          description="T"
          shape="square"
          badge={{
            count: Object.keys(allData).filter((key) => {
              return /success/.test(JSON.stringify(allData[key]));
            }).length,
            color: "yellowgreen",
          }}
        />
        <FloatButton
          description="F"
          shape="square"
          badge={{
            count: Object.keys(allData).filter((key) => {
              return /error/.test(JSON.stringify(allData[key]));
            }).length,
            color: "red",
          }}
        />
        <FloatButton
          description="N"
          shape="square"
          badge={{
            count: dataSource.filter(({ index }) => {
              return (
                !/-/.test(index) &&
                !/error|success/.test(JSON.stringify(allData[index]))
              );
            }).length,
            color: "gray",
            overflowCount: "102",
          }}
        />
        <FloatButton.BackTop visibilityHeight={0} />
      </FloatButton.Group>
    </div>
  );
}

export default App;
