import { MinusOutlined, PlusOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Col, Modal, Popconfirm, Row, Space, Table, message, notification } from "antd";
import { ModalProps } from "antd/es/modal/interface";
import React, { useEffect, useReducer, useState } from "react";
import * as PortForwardApi from "../../api/ApiPortForwarder";
import { InputPortForward } from "../../component/InputPortForward";
import { getUUID } from "../../functions";
import { PortForward, portForwardsReducer } from "../../hook/PortForwardContext";
import './index.css';

const initPortForward: PortForward = {
  id: getUUID(),
  source: { ip: "", port: 0, proto: "ipv4" },
  target: { ip: "", port: 0, proto: "ipv4" },
}

function SavePortForwardModal(props: { modal?: ModalProps, data?: PortForward[], onOk?: (data: PortForward[]) => any }) {
  /** 初始化状态 **/
  const [portForwards, setPortForwards] = useReducer(portForwardsReducer, props.data || [initPortForward])
  const [submitDisable, setSubmitDisable] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [inputItems, setInputItems] = useState<Record<string, {validated: boolean}>>(portForwards.reduce<Record<string, {validated: boolean}>>((obj, item) => {
    obj[item.id] = {validated: false};
    return obj;
  }, {}))

  /** 定义事件处理函数 **/
  const onSubmitHandle = () => {
    setSubmitLoading(true)
    PortForwardApi.BatchAdd(portForwards)
      .then(() => props.onOk?.(portForwards))
      .catch((reason) => {
        notification.error({
          message: "操作失败",
          description: reason
        })
      })
      .finally(() => setSubmitLoading(false))
  }

  const onAddHandle = () => {
    const id = getUUID()
    setPortForwards({ type: "added", payload: [{ ...initPortForward, id }] })
  }

  const onDelHandle = (ids: string[]) => {
    setPortForwards({ type: "deleted", payload: ids })
    const newInputItems = {...inputItems}
    ids.forEach(id => (delete newInputItems[id]))
    setInputItems(newInputItems)
  }

  const onChangedHandle = (value: PortForward) => {
    setPortForwards({ type: "changed", payload: [{ ...value}] })
  }

  const onValidatedHandle = (id: string, value: boolean) => {
    const newInputItems = {...inputItems}
    newInputItems[id] = {validated: value}
    setInputItems(newInputItems)
  }

  useEffect(() => {
    let validated = false
    for (let key in inputItems) {
      validated = inputItems[key].validated
    }

    setSubmitDisable(!validated)
  }, [inputItems]);

  /** 数据处理 **/


  /** 视图渲染 **/
  return <Modal okButtonProps={{disabled: submitDisable}} width={790} title="添加端口映射" cancelText="取消" okText="提交" {...props.modal} onOk={onSubmitHandle}
    confirmLoading={submitLoading}>
    <Space style={{ marginTop: 10, width: "100%" }} direction="vertical" size="middle">
      {
        portForwards.map((item) => {
          return <Row key={item.id}>
            <Col span={22}><InputPortForward onReverse={onChangedHandle} onValidated={(value) => onValidatedHandle(item.id, value)} onChanged={onChangedHandle} value={item} /></Col>
            <Col span={2} style={{ textAlign: "right" }}>
              <Button
                onClick={() => onDelHandle([item.id])}
                disabled={portForwards.length <= 1} danger ghost type="primary"
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


interface PortForwardListProps {
  title?: string
  children?: React.ReactNode
}

const portForwardList: PortForward[] = [
  // {
  //   id: getUUID(),
  //   source: { ip: "192.168.123.137", port: 8080, proto: "ipv4" },
  //   target: { ip: "10.0.0.1", port: 80, proto: "ipv4" },
  // },
  // {
  //   id: getUUID(),
  //   source: { ip: "192.168.123.137", port: 9000, proto: "ipv4" },
  //   target: { ip: "10.0.0.1", port: 9001, proto: "ipv4" },
  // }
];

export default function PortForwardList(props: PortForwardListProps) {
  /** 初始化状态 **/
  const [isOpenSaveModal, setIsOpenSaveModal] = useState(false)
  const [saveModalKey, setSaveModalKey] = useState("add")
  const [isRefreshLoading, setIsRefreshLoading] = useState(false)
  const [isDelLoading, setIsDelLoading] = useState(false)
  const [isDelBtnDisable, setIsDelBtnDisable] = useState(true)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [savePortForwards, setSavePortForwards] = useReducer(portForwardsReducer, [initPortForward])
  const [tableData, setTableData] = useReducer(portForwardsReducer, portForwardList)

  const onClickRefreshHandle = () => {
    refreshTableData()
  }

  const onClickDelHandle = () => {
    setIsDelLoading(true)
    PortForwardApi.BatchDelete(tableData.filter(item => selectedRowKeys.includes(item.id)))
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
    setSavePortForwards({ type: "init", payload: [initPortForward] })
    setSaveModalKey(getUUID())
    setIsOpenSaveModal(true)
  }

  const onEditHandle = () => {
    setSavePortForwards({
      type: "init",
      payload: tableData.filter(item => selectedRowKeys.includes(item.id))
    })

    setSaveModalKey(getUUID())
    setIsOpenSaveModal(true)
  }

  const refreshTableData = () => {
    setIsRefreshLoading(true)
    setIsDelBtnDisable(true)
    PortForwardApi.Get()
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
      <SavePortForwardModal onOk={onOkHandle} key={saveModalKey} data={savePortForwards} modal={{ open: isOpenSaveModal, onCancel: () => setIsOpenSaveModal(false) }} />
      {/*<SavePortForwardModal data={savePortForwards} modal={{open: isOpenSaveModal, onCancel: () => setIsOpenSaveModal(false)}}/>*/}

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

      <Table<PortForward> rowSelection={rowSelection} dataSource={tableData} rowKey="id">
        <Table.Column<PortForward> key="source" title="来源" render={(text, record) => (
          <code className="code">{record.source.ip}:{record.source.port}</code>
        )} />
        <Table.Column<PortForward> key="proto" title="协议" render={(text, record) => (
          <code className="code">{record.source.proto}/{record.target.proto}</code>
        )} />
        <Table.Column<PortForward> key="target" title="目标" render={(text, record) => (
          <code className="code">{record.target.ip}:{record.target.port}</code>
        )} />
      </Table>
    </div>
  </>
}