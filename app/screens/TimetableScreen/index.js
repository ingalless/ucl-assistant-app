import React, { Component } from "react";
import { View } from "react-native";
import { connect } from "react-redux";
import { NavigationActions } from "react-navigation";
import PropTypes from "prop-types";
import { Feather } from "@expo/vector-icons";
import moment from "moment";
import { fetchTimetable } from "../../actions/timetableActions";
import { TitleText, SubtitleText, BodyText } from "../../components/Typography";
import { MainTabPage } from "../../components/Containers";
import Button from "../../components/Button";
import Colors from "../../constants/Colors";
import TimetableComponent from "./TimetableComponent";
import DateControls from "./DateControls";

class TimetableScreen extends Component {
  static navigationOptions = {
    header: null,
    tabBarIcon: ({ focused }) => (
      <Feather
        name="calendar"
        size={28}
        color={focused ? Colors.pageBackground : Colors.textColor}
      />
    ),
  };

  static propTypes = {
    navigation: PropTypes.shape().isRequired,
    user: PropTypes.shape(),
    timetable: PropTypes.shape(),
    error: PropTypes.string,
    fetchTimetable: PropTypes.func,
    isFetchingTimetable: PropTypes.bool,
  };

  static defaultProps = {
    user: {},
    timetable: {},
    error: "",
    fetchTimetable: () => {},
    isFetchingTimetable: false,
  };

  static mapStateToProps = state => ({
    user: state.user,
    timetable: state.timetable.timetable,
    isFetchingTimetable: state.timetable.isFetching,
    error: state.timetable.error,
  });

  static mapDispatchToProps = dispatch => ({
    fetchTimetable: (token, date) => dispatch(fetchTimetable(token, date)),
  });

  constructor(props) {
    super(props);
    this.state = {
      date: moment().startOf("day"),
    };
  }

  componentDidMount() {
    if (this.loginCheck(this.props) && this.props.user.token !== "") {
      this.props.fetchTimetable(this.props.user.token, this.state.date);
    }
  }

  async onDateChanged(newDate) {
    await this.setState({
      date: newDate.startOf("day"),
    });
    this.props.fetchTimetable(this.props.user.token, this.state.date);
  }

  loginCheck(props) {
    if (Object.keys(props.user).length > 0) {
      if (props.user.scopeNumber < 0) {
        this.props.navigation.dispatch(
          NavigationActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: "Splash" })],
          }),
        );
        return false;
      }
    }
    return true;
  }

  render() {
    const { navigate } = this.props.navigation;
    const { user, timetable, isFetchingTimetable } = this.props;
    const { scopeNumber } = user;
    const { date } = this.state;
    const dateString = date.format("dddd, Do MMMM");
    return (
      <MainTabPage>
        {scopeNumber < 0 && (
          <View>
            <BodyText>You are not signed in.</BodyText>
            <Button onPress={() => navigate("Splash")}>Sign In</Button>
          </View>
        )}
        <TitleText>Your Timetable</TitleText>
        <SubtitleText>{dateString}</SubtitleText>
        <DateControls date={date} onDateChanged={d => this.onDateChanged(d)} />
        <TimetableComponent
          timetable={timetable}
          date={date}
          isLoading={isFetchingTimetable}
        />
        {!date.isSame(moment().startOf("day")) && (
          <Button onPress={() => this.onDateChanged(moment())}>
            Jump To Today
          </Button>
        )}

        {/* <SubtitleText>Find A Timetable</SubtitleText>
        <BodyText>Coming soon.</BodyText> */}
      </MainTabPage>
    );
  }
}

export default connect(
  TimetableScreen.mapStateToProps,
  TimetableScreen.mapDispatchToProps,
)(TimetableScreen);