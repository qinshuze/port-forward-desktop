import { MinusOutlined, PlusOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Col, Modal, Popconfirm, Row, Space, Table, message, notification } from "antd";
import { ModalProps } from "antd/es/modal/interface";
import React, { useEffect, useReducer, useState } from "react";
import * as PortMapApi from "../../api/PortMapApi";
import { InputPortMap } from "../../component/InputPortMap";
import { getUUID } from "../../functions";
import { PortMap, portMapsReducer } from "../../hook/PortMapsContext";
import './index.css';

const initPortMap: PortMap = {
  id: getUUID(),
  source: { ip: "", port: 0, proto: "ipv4" },
  target: { ip: "", port: 0, proto: "ipv4" },
}

function SavePortMapModal(props: { modal?: ModalProps, data?: PortMap[], onOk?: (data: PortMap[]) => any }) {
  /** 初始化状态 **/
  const [portMaps, setPortMaps] = useReducer(portMapsReducer, props.data || [initPortMap])
  const [submitLoading, setSubmitLoading] = useState(false)

  /** 定义事件处理函数 **/
  const onSubmitHandle = () => {
    setSubmitLoading(true)
    PortMapApi.BatchAdd(portMaps)
      .then(() => props.onOk?.(portMaps))
      .catch((reason) => {
        notification.error({
          message: "操作失败",
          description: reason
        })
      })
      .finally(() => setSubmitLoading(false))
  }

  const onAddHandle = () => {
    setPortMaps({ type: "added", payload: [{ ...initPortMap, id: getUUID() }] })
  }

  const onDelHandle = (ids: string[]) => {
    setPortMaps({ type: "deleted", payload: ids })
  }

  const onChangedHandle = (value: PortMap) => {
    setPortMaps({ type: "changed", payload: [{ ...value}] })
  }

  /** 数据处理 **/


  /** 视图渲染 **/
  return <Modal width={790} title="添加端口映射" cancelText="取消" okText="提交" {...props.modal} onOk={onSubmitHandle}
    confirmLoading={submitLoading}>
    <Space style={{ marginTop: 10, width: "100%" }} direction="vertical" size="middle">
      {
        portMaps.map((item) => {
          return <Row key={item.id}>
            <Col span={22}><InputPortMap onReverse={onChangedHandle} onChanged={onChangedHandle} value={item} /></Col>
            <Col span={2} style={{ textAlign: "right" }}>
              <Button
                onClick={() => onDelHandle([item.id])}
                disabled={portMaps.length <= 1} danger ghost type="primary"
                shape="circle"
              >
                <MinusOutlined />
              </Button>
            </Col>
          </Row>
        })
      }
    </Space>

    <Button
      onClick={onAddHandle}
      size="large" type="dashed" block
      style={{ margin: "40px 0 20px 0", color: "#aeaeae", borderRadius: 0 }}>
      <PlusOutlined />
    </Button>
  </Modal>
}


interface PortMapListProps {
  title?: string
  children?: React.ReactNode
}

const portMapList: PortMap[] = [
  {
    id: getUUID(),
    source: { ip: "192.168.123.137", port: 8080, proto: "ipv4" },
    target: { ip: "10.0.0.1", port: 80, proto: "ipv4" },
  },
  {
    id: getUUID(),
    source: { ip: "192.168.123.137", port: 9000, proto: "ipv4" },
    target: { ip: "10.0.0.1", port: 9001, proto: "ipv4" },
  }
];

export function PortMapList(props: PortMapListProps) {
  /** 初始化状态 **/
  const [isOpenSaveModal, setIsOpenSaveModal] = useState(false)
  const [saveModalKey, setSaveModalKey] = useState("add")
  const [isRefreshLoading, setIsRefreshLoading] = useState(false)
  const [isDelLoading, setIsDelLoading] = useState(false)
  const [isDelBtnDisable, setIsDelBtnDisable] = useState(true)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [savePortMaps, setSavePortMaps] = useReducer(portMapsReducer, [initPortMap])
  const [tableData, setTableData] = useReducer(portMapsReducer, portMapList)

  const onClickRefreshHandle = () => {
    refreshTableData()
  }

  const onClickDelHandle = () => {
    setIsDelLoading(true)
    PortMapApi.BatchDelete(tableData.filter(item => selectedRowKeys.includes(item.id)))
      .then(() => refreshTableData())
      .catch((errmsg) => {
        notification.error({
          message: "操作失败",
          description: errmsg
        })
      })
      .finally(() => setIsDelLoading(false))
  }

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const onAddHandle = () => {
    setSavePortMaps({ type: "init", payload: [initPortMap] })
    setSaveModalKey(getUUID())
    setIsOpenSaveModal(true)
  }

  const onEditHandle = () => {
    setSavePortMaps({
      type: "init",
      payload: tableData.filter(item => selectedRowKeys.includes(item.id))
    })

    setSaveModalKey(getUUID())
    setIsOpenSaveModal(true)
  }

  const refreshTableData = () => {
    setIsRefreshLoading(true)
    setIsDelBtnDisable(true)
    PortMapApi.Get()
      .then(res => setTableData({ type: "init", payload: [...res] })
      ).catch(errmsg => {
        notification.error({
          message: "操作失败",
          description: errmsg
        })
      })
      .finally(() => {
        setIsRefreshLoading(false)
      })
  }

  const onOkHandle = () => {
    refreshTableData()
    setIsOpenSaveModal(false)
  }

  // 初始化
  useEffect(() => {
    refreshTableData()
  }, [])

  useEffect(() => {
    setIsDelBtnDisable(selectedRowKeys.length === 0)
  }, [selectedRowKeys])

  return <>
    <div className="port-map-list">
      <SavePortMapModal onOk={onOkHandle} key={saveModalKey} data={savePortMaps} modal={{ open: isOpenSaveModal, onCancel: () => setIsOpenSaveModal(false) }} />
      {/*<SavePortMapModal data={savePortMaps} modal={{open: isOpenSaveModal, onCancel: () => setIsOpenSaveModal(false)}}/>*/}

      <Row align="middle">
        <Col span={8}><h2>{props.title || "端口映射列表"}</h2></Col>
        <Col span={10} offset={6} style={{ textAlign: "right" }}>
          <Button onClick={onAddHandle} type="primary" style={{ marginRight: 10 }}>添加</Button>
          {/* <Button className="btn-green" onClick={onEditHandle} disabled={isDelBtnDisable} style={{ marginRight: 10 }}>编辑</Button> */}
          <Popconfirm
            placement="bottom"
            title="是否确认删除选中记录？"
            description="点击确认按钮删除记录"
            okText="确认"
            cancelText="取消"
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            onConfirm={onClickDelHandle}
          >
            <Button loading={isDelLoading} type="primary" disabled={isDelBtnDisable} danger
              style={{ marginRight: 10 }}>删除</Button>
          </Popconfirm>
          <Button loading={isRefreshLoading} onClick={onClickRefreshHandle}>刷新</Button>
        </Col>
      </Row>

      <Table<PortMap> rowSelection={rowSelection} dataSource={tableData} rowKey="id">
        <Table.Column<PortMap> key="source" title="来源" render={(text, record) => (
          <code className="code">{record.source.ip}:{record.source.port}</code>
        )} />
        <Table.Column<PortMap> key="proto" title="协议" render={(text, record) => (
          <code className="code">{record.source.proto}/{record.target.proto}</code>
        )} />
        <Table.Column<PortMap> key="target" title="目标" render={(text, record) => (
          <code className="code">{record.target.ip}:{record.target.port}</code>
        )} />
      </Table>
    </div>
  </>
}