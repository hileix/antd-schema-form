import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { Form, Tooltip, Input, Select, Radio, DatePicker } from 'antd';
import moment from 'moment';
import Context from '../../context';
import styleName from '../../utils/styleName';
import { isString, isFunction } from '../../utils/type';
import createStringRules from './createStringRules';
import InputPassword from './InputPassword';

/**
 * 当类型为string时的组件渲染
 * json schema的属性包括：id, type, title, description, pattern, minLength, maxLength, enum
 *
 * 扩展属性前必须加上"$"
 * 扩展属性包括：required, componentType, readOnly, length, patternOption, enumMessage, lengthMessage, requiredMessage,
 *   patternMessage, minLengthMessage, maxLengthMessage, options, defaultValue, placeholder
 */
class FormString extends Component{
  static contextType: Object = Context;
  static propTypes: Object = {
    root: PropTypes.object,
    required: PropTypes.bool
  };

  inputRef: Object = createRef();

  // 文件上传点击事件
  handleFileUpdateClick: Function = (event: Event): void=>{
    this.inputRef.current.click();
  };
  // select的下拉框
  selectOptionsView(options: Array<{ label: string, value: string }>): React.ChildrenArray<React.Element>{
    return options.map((item: Object, index: number): React.Element=>{
      return <Select.Option key={ index } value={ item.value }>{ item.label }</Select.Option>;
    });
  }
  render(): React.Element{
    const { form, customComponent }: { form: Object, customComponent: Object } = this.context;
    const { getFieldDecorator }: { getFieldDecorator: Function } = form;
    // type=object时，会判断key是否存在于required数组中
    const { root, required }: {
      root: Object,
      required: boolean
    } = this.props;
    const { id, title, description, $required, $componentType, $readOnly, $defaultValue, $options = [], $placeholder }: {
      id: string,
      title: string,
      description: string,
      $required: boolean,
      $componentType: ?string,
      $readOnly: ?boolean,
      $defaultValue: ?string,
      $options: ?Array<{ label: string, value: string}>,
      $placeholder: ?string
    } = root;
    const rules: Array = createStringRules(this.props.root, required);
    const option: Object = { rules };
    let element: ?React.Element = null;

    // 表单默认值
    if($defaultValue) option.initialValue = $defaultValue;

    // 格式化日历的日期
    if($componentType === 'date' && isString($defaultValue)){
      option.initialValue = moment($defaultValue);
    }

    switch($componentType){
      // 文本域
      case 'textArea':
        element = getFieldDecorator(id, option)(
          <Input.TextArea rows={ 6 } readOnly={ $readOnly } placeholder={ $placeholder } />
        );
        break;

      // 渲染select
      case 'select':
        element = getFieldDecorator(id, option)(
          <Select className={ styleName('string-select') }
            readOnly={ $readOnly }
            placeholder={ $placeholder }
            allowClear={ !$required }
          >
            { this.selectOptionsView($options) }
          </Select>
        );
        break;

      // 渲染radio
      case 'radio':
        element = getFieldDecorator(id, option)(<Radio.Group options={ $options } />);
        break;

      // 渲染日期组件
      case 'date':
        element = getFieldDecorator(id, option)(
          <DatePicker format="YYYY-MM-DD HH:mm:ss" showTime={ true } placeholder={ $placeholder } />
        );
        break;

      // password
      case 'password':
        element = getFieldDecorator(id, option)(
          // 兼容Input.Password组件
          'Password' in Input
            ? <Input.Password readOnly={ $readOnly } placeholder={ $placeholder } />
            : <InputPassword readOnly={ $readOnly } placeholder={ $placeholder } />
        );
        break;

      // 渲染默认组件
      default:
        element = $componentType in customComponent
          ? customComponent[$componentType](root, option, form, required)
          : getFieldDecorator(id, option)(<Input readOnly={ $readOnly } placeholder={ $placeholder } />);
        break;
    }

    return (
      <Form.Item label={ title }>
        <Tooltip title={ description } placement="topRight">
          { element }
        </Tooltip>
      </Form.Item>
    );
  }
}

export default FormString;